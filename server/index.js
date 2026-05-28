const express = require('express');
const cors = require('cors');
const { sql, connectDB } = require('./db');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Serve static files from uploads folder
app.use('/uploads', express.static(uploadDir));

// Connect to Database
connectDB();

// --- ROUTES ---

// 1. Get Shop Details
app.get('/api/shop', async (req, res) => {
    try {
        const result = await sql.query('SELECT TOP 1 * FROM ShopMaster');
        res.json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// 1.1 Update Shop Details
app.post('/api/shop', async (req, res) => {
    const { ShopName, Tagline, Address, Phone, TaxRate } = req.body;
    try {
        const request = new sql.Request();
        request.input('ShopName', sql.NVarChar, ShopName);
        request.input('Tagline', sql.NVarChar, Tagline);
        request.input('Address', sql.NVarChar, Address);
        request.input('Phone', sql.NVarChar, Phone);
        request.input('TaxRate', sql.Decimal(5, 2), TaxRate);

        await request.query(`
            UPDATE ShopMaster 
            SET ShopName = @ShopName, Tagline = @Tagline, Address = @Address, Phone = @Phone, TaxRate = @TaxRate
        `);
        res.json({ message: 'Shop details updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating shop details');
    }
});

// 2. Get Laundry Items
app.get('/api/items', async (req, res) => {
    try {
        const result = await sql.query('SELECT ItemID, ItemName, DefaultPrice as UnitPrice, IsActive FROM LaundryItemMaster WHERE IsActive = 1');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// 2.1 Add Laundry Item
app.post('/api/items', async (req, res) => {
    const { ItemName, UnitPrice } = req.body;
    try {
        const request = new sql.Request();
        request.input('ItemName', sql.NVarChar, ItemName);
        request.input('DefaultPrice', sql.Decimal(10, 2), UnitPrice);

        await request.query('INSERT INTO LaundryItemMaster (ItemName, DefaultPrice, IsActive) VALUES (@ItemName, @DefaultPrice, 1)');
        res.status(201).json({ message: 'Item added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding item');
    }
});

// 2.2 Update Laundry Item
app.put('/api/items/:id', async (req, res) => {
    const { id } = req.params;
    const { ItemName, UnitPrice } = req.body;
    try {
        const request = new sql.Request();
        request.input('ItemID', sql.Int, id);
        request.input('ItemName', sql.NVarChar, ItemName);
        request.input('DefaultPrice', sql.Decimal(10, 2), UnitPrice);

        const result = await request.query('UPDATE LaundryItemMaster SET ItemName = @ItemName, DefaultPrice = @DefaultPrice WHERE ItemID = @ItemID');
        if (result.rowsAffected[0] === 0) return res.status(404).send('Item not found');
        res.json({ message: 'Item updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating item');
    }
});

// 2.3 Delete Laundry Item (Soft Delete)
app.delete('/api/items/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const request = new sql.Request();
        request.input('ItemID', sql.Int, id);
        await request.query('UPDATE LaundryItemMaster SET IsActive = 0 WHERE ItemID = @ItemID');
        res.json({ message: 'Item deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting item');
    }
});

// 3. Save Bill
app.post('/api/bills', async (req, res) => {
    const { customerName, customerPhone, customerTown, returnDate, items, subtotal, tax, grandTotal, invoiceNum } = req.body;

    // Start Transaction
    const transaction = new sql.Transaction();

    try {
        await transaction.begin();

        // Save Header
        const request = new sql.Request(transaction);
        request.input('InvoiceNumber', sql.NVarChar, invoiceNum);
        request.input('CustomerName', sql.NVarChar, customerName);
        request.input('CustomerPhone', sql.NVarChar, customerPhone);
        request.input('CustomerTown', sql.NVarChar, customerTown);
        request.input('ReturnDate', sql.DateTime, returnDate || null);
        request.input('SubTotal', sql.Decimal(10, 2), subtotal);
        request.input('TaxAmount', sql.Decimal(10, 2), tax);
        request.input('GrandTotal', sql.Decimal(10, 2), grandTotal);

        const headerResult = await request.query(`
            INSERT INTO Bills (InvoiceNumber, CustomerName, CustomerPhone, CustomerTown, ReturnDate, SubTotal, TaxAmount, GrandTotal)
            OUTPUT INSERTED.BillID
            VALUES (@InvoiceNumber, @CustomerName, @CustomerPhone, @CustomerTown, @ReturnDate, @SubTotal, @TaxAmount, @GrandTotal)
        `);

        const billId = headerResult.recordset[0].BillID;

        // Save Items
        for (const item of items) {
            const itemRequest = new sql.Request(transaction);
            itemRequest.input('BillID', sql.Int, billId);
            itemRequest.input('ItemName', sql.NVarChar, item.name);
            itemRequest.input('Quantity', sql.Int, item.qty);
            itemRequest.input('UnitPrice', sql.Decimal(10, 2), item.price);
            itemRequest.input('TotalPrice', sql.Decimal(10, 2), item.total);

            await itemRequest.query(`
                INSERT INTO BillItems (BillID, ItemName, Quantity, UnitPrice, TotalPrice)
                VALUES (@BillID, @ItemName, @Quantity, @UnitPrice, @TotalPrice)
            `);
        }

        await transaction.commit();
        res.status(201).json({ message: 'Bill saved successfully', billId });

    } catch (err) {
        if (transaction.active) await transaction.rollback();
        console.error(err);
        res.status(500).send('Error saving bill');
    }
});

// 4. Mark Bill as Paid
app.put('/api/bills/:id/pay', async (req, res) => {
    const { id } = req.params;
    try {
        const request = new sql.Request();
        request.input('BillID', sql.Int, id);
        await request.query("UPDATE Bills SET PaymentStatus = 'Paid' WHERE BillID = @BillID");
        res.json({ message: 'Bill marked as paid' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating payment status');
    }
});

// 4.1 Get Pending Bills
app.get('/api/bills/pending', async (req, res) => {
    try {
        const result = await sql.query("SELECT * FROM Bills WHERE PaymentStatus = 'Pending' OR PaymentStatus IS NULL ORDER BY BillDate DESC");
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching pending bills');
    }
});

// 4.2 Get Bill Items (Detail View)
app.get('/api/bills/:id/items', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql.query(`SELECT * FROM BillItems WHERE BillID = ${id}`);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching bill items');
    }
});

// 5. Upload PDF
app.post('/api/upload-pdf', async (req, res) => {
    try {
        const { pdfData, fileName } = req.body;
        if (!pdfData) return res.status(400).send('No PDF data provided');

        const base64Data = pdfData.replace(/^data:application\/pdf;base64,/, "");
        const filePath = path.join(uploadDir, fileName);

        fs.writeFileSync(filePath, base64Data, 'base64');

        // Construct the full URL
        const protocol = req.protocol;
        const host = req.get('host');
        const fileUrl = `${protocol}://${host}/uploads/${fileName}`;

        res.json({ message: 'File uploaded successfully', url: fileUrl });
    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).send('Error uploading file');
    }
});

// --- REPORTING ROUTES ---

// 5. Dashboard Summary
app.get('/api/reports/dashboard', async (req, res) => {
    try {
        const stats = {};

        // 1. Today's Revenue & Order Count
        const todayRes = await sql.query(`
            SELECT 
                ISNULL(SUM(GrandTotal), 0) as Revenue,
                COUNT(*) as Orders
            FROM Bills 
            WHERE CAST(BillDate AS DATE) = CAST(GETDATE() AS DATE)
        `);
        stats.today = todayRes.recordset[0];

        // 2. Pending Deliveries (Due Today or Overdue)
        const pendingRes = await sql.query(`
            SELECT COUNT(*) as PendingCount
            FROM Bills 
            WHERE CAST(ReturnDate AS DATE) <= CAST(GETDATE() AS DATE)
            AND (PaymentStatus IS NULL OR PaymentStatus != 'Paid')
        `);
        stats.pendingDeliveries = pendingRes.recordset[0].PendingCount;

        // 3. Top 5 Items
        const topItemsRes = await sql.query(`
            SELECT TOP 5 ItemName, SUM(Quantity) as TotalQty
            FROM BillItems
            GROUP BY ItemName
            ORDER BY TotalQty DESC
        `);
        stats.topItems = topItemsRes.recordset;

        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching dashboard stats');
    }
});

// 6. Financial Report (Sales History)
app.get('/api/reports/financial', async (req, res) => {
    try {
        const result = await sql.query(`
            SELECT TOP 100 * 
            FROM Bills 
            ORDER BY BillDate DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching financial report');
    }
});

// 7. Operational Report (Pending Deliveries - Unpaid/Pending only)
app.get('/api/reports/operational', async (req, res) => {
    try {
        const result = await sql.query(`
            SELECT * 
            FROM Bills 
            WHERE CAST(ReturnDate AS DATE) <= CAST(GETDATE() AS DATE)
            AND (PaymentStatus IS NULL OR PaymentStatus != 'Paid')
            ORDER BY ReturnDate ASC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching operational report');
    }
});

// 8. Monthly Sales Report
app.get('/api/reports/monthly-sales', async (req, res) => {
    try {
        const result = await sql.query(`
            SELECT 
                FORMAT(BillDate, 'MMMM') as MonthName,
                YEAR(BillDate) as Year,
                MONTH(BillDate) as MonthNum,
                SUM(GrandTotal) as TotalSales,
                COUNT(*) as TotalOrders
            FROM Bills 
            GROUP BY YEAR(BillDate), MONTH(BillDate), FORMAT(BillDate, 'MMMM')
            ORDER BY YEAR(BillDate) DESC, MONTH(BillDate) DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching monthly sales');
    }
});

// 9. Overdue Report (Pending Payment & Return Date Passed)
app.get('/api/reports/overdue', async (req, res) => {
    try {
        const result = await sql.query(`
            SELECT * 
            FROM Bills 
            WHERE CAST(ReturnDate AS DATE) < CAST(GETDATE() AS DATE)
            AND (PaymentStatus IS NULL OR PaymentStatus != 'Paid')
            ORDER BY ReturnDate ASC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching overdue report');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
