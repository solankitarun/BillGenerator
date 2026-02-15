-- Run this script to update your existing database

USE LaundryDB;
GO

-- 1. Add new columns to Bills table
ALTER TABLE Bills
ADD ReturnDate DATETIME NULL;

ALTER TABLE Bills
ADD CustomerTown NVARCHAR(100) NULL;


-- 2. Add PaymentStatus column to Bills table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Bills' AND COLUMN_NAME = 'PaymentStatus')
BEGIN
    ALTER TABLE Bills
    ADD PaymentStatus NVARCHAR(20) DEFAULT 'Pending';
END

GO
