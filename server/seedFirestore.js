const { db, connectDB } = require('./db');
const bcrypt = require('bcryptjs');

async function seedData() {
    connectDB();

    // 1. Seed Shop Details
    const shopRef = db.collection('ShopMaster');
    const shopSnapshot = await shopRef.limit(1).get();
    if (shopSnapshot.empty) {
        await shopRef.add({
            ShopName: 'FreshWash',
            Tagline: 'Quality Laundry Services',
            Address: '123, Main Street, Your City',
            Phone: '9725000595',
            TaxRate: 5
        });
        console.log('✔ ShopMaster seeded.');
    }

    // 2. Seed Items
    const itemsRef = db.collection('LaundryItemMaster');
    const itemsSnapshot = await itemsRef.limit(1).get();
    if (itemsSnapshot.empty) {
        const defaultItems = [
            { ItemName: 'Shirt', DefaultPrice: 10, IsActive: 1 },
            { ItemName: 'Pant', DefaultPrice: 15, IsActive: 1 },
            { ItemName: 'Saree', DefaultPrice: 50, IsActive: 1 },
            { ItemName: 'Blanket', DefaultPrice: 100, IsActive: 1 }
        ];
        for (const item of defaultItems) {
            await itemsRef.add(item);
        }
        console.log('✔ LaundryItemMaster seeded.');
    }

    // 3. Seed Users (Default Admin)
    const usersRef = db.collection('Users');
    const usersSnapshot = await usersRef.where('username', '==', 'admin').get();

    if (usersSnapshot.empty) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await usersRef.add({
            username: 'admin',
            password: hashedPassword,
            createdAt: new Date().toISOString()
        });
        console.log('✔ Users seeded with default admin.');
    }
}

seedData().catch(console.error);
