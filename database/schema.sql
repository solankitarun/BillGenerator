-- Create Database (Run this if DB doesn't exist)
-- CREATE DATABASE LaundryDB;
-- GO
-- USE LaundryDB;
-- GO

-- 1. ShopMaster - Stores the laundry shop details
CREATE TABLE ShopMaster (
    ShopID INT IDENTITY(1,1) PRIMARY KEY,
    ShopName NVARCHAR(100) NOT NULL,
    Tagline NVARCHAR(200),
    Address NVARCHAR(500),
    Phone NVARCHAR(50),
    TaxRate DECIMAL(5, 2) DEFAULT 0.05 -- 5% default
);

-- 2. LaundryItemMaster - Stores standard items
CREATE TABLE LaundryItemMaster (
    ItemID INT IDENTITY(1,1) PRIMARY KEY,
    ItemName NVARCHAR(100) NOT NULL,
    DefaultPrice DECIMAL(10, 2) NOT NULL,
    IsActive BIT DEFAULT 1
);

-- 3. Bills - Header table for each transaction
CREATE TABLE Bills (
    BillID INT IDENTITY(1,1) PRIMARY KEY,
    InvoiceNumber NVARCHAR(50) UNIQUE NOT NULL,
    CustomerName NVARCHAR(100),
    CustomerPhone NVARCHAR(20),
    BillDate DATETIME DEFAULT GETDATE(),
    SubTotal DECIMAL(10, 2),
    TaxAmount DECIMAL(10, 2),
    GrandTotal DECIMAL(10, 2)
);

-- 4. BillItems - Line items for each bill
CREATE TABLE BillItems (
    BillItemID INT IDENTITY(1,1) PRIMARY KEY,
    BillID INT FOREIGN KEY REFERENCES Bills(BillID),
    ItemName NVARCHAR(100) NOT NULL, -- Storing name in case Master changes
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(10, 2) NOT NULL,
    TotalPrice DECIMAL(10, 2) NOT NULL
);

-- SEED DATA -----------------------------------------------------------

-- Seed ShopMaster
INSERT INTO ShopMaster (ShopName, Tagline, Address, Phone, TaxRate)
VALUES ('FreshWash Laundry', 'Premium Care for Your Clothes', '123 Bubble Ave, Clean City', '555-0123', 0.05);

-- Seed LaundryItemMaster
INSERT INTO LaundryItemMaster (ItemName, DefaultPrice) VALUES 
('Shirt', 5.00),
('Pants', 7.00),
('Suit', 15.00),
('Dress', 12.00),
('Jacket', 10.00),
('Bed Sheet', 8.00);
