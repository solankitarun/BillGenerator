const { sql, connectDB } = require('./db');

async function runMigration() {
    await connectDB();

    try {
        console.log('Applying migrations...');

        // 1. ReturnDate
        try {
            await sql.query(`
                IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Bills' AND COLUMN_NAME = 'ReturnDate')
                ALTER TABLE Bills ADD ReturnDate DATETIME NULL;
            `);
            console.log('Checked/Added ReturnDate');
        } catch (e) {
            console.log('Error adding ReturnDate:', e.message);
        }

        // 2. CustomerTown
        try {
            await sql.query(`
                IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Bills' AND COLUMN_NAME = 'CustomerTown')
                ALTER TABLE Bills ADD CustomerTown NVARCHAR(100) NULL;
            `);
            console.log('Checked/Added CustomerTown');
        } catch (e) {
            console.log('Error adding CustomerTown:', e.message);
        }

        // 3. PaymentStatus
        try {
            await sql.query(`
                IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Bills' AND COLUMN_NAME = 'PaymentStatus')
                ALTER TABLE Bills ADD PaymentStatus NVARCHAR(20) DEFAULT 'Pending';
            `);
            console.log('Checked/Added PaymentStatus');
        } catch (e) {
            console.log('Error adding PaymentStatus:', e.message);
        }

        console.log('Migration completed.');
        process.exit(0);

    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

runMigration();
