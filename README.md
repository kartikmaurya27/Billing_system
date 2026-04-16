# 🍵 Chai Ki Chuski - Enhanced Web Dashboard

## Overview
A complete web-based dashboard for managing a tea shop with Excel database integration, transaction history tracking, and comprehensive data export capabilities.

## 🆕 New Features Added

### 1. **📜 Transaction History Page**
- View all transactions in chronological order
- Filter by type: Orders, Stock Updates, Revenue, or All
- Each transaction shows:
  - Timestamp with date and time
  - Transaction type (color-coded)
  - Detailed information about the transaction
- Export history to Excel
- Clear all history option

### 2. **💾 Database Management Page**
Complete data export capabilities with the following options:

#### Individual Exports:
- **Menu Items**: Export all menu items with pricing and stock levels
- **Orders**: Complete order history with customer details
- **Customers**: Customer database with contact information
- **Revenue**: Revenue records by date
- **Stock History**: All stock update transactions

#### Bulk Export:
- **Complete Database**: Export everything to a single Excel file with multiple sheets
- **JSON Backup**: Download all data as a JSON file for backup/restoration

#### Database Actions:
- **Reset Database**: Clear all data and restore default menu items
- **Backup Database**: Download complete backup as JSON

### 3. **📊 Stock History Tracking**
- Every stock update is now logged
- Track who updated stock, when, and by how much
- View old stock → new stock changes
- Export stock history to Excel

### 4. **🔍 Enhanced Transaction Logging**
All actions are now tracked:
- Order creation
- Stock updates
- Revenue entries
- Menu item additions

## 📋 Features Overview

### Menu & Ordering
- Browse menu items by category (Chai, Snacks, Drinks, Food)
- Real-time stock availability
- Add items to cart
- Enter customer details
- Confirm and save orders

### Order Management
- View all orders in a table
- Mark orders as complete
- Generate printable bills
- Track order status (Pending/Completed)

### Stock Management
- View current stock levels
- Update stock quantities
- Add new menu items
- Real-time stock tracking

### Revenue Tracking
- Filter by: Today, Yesterday, This Week, This Month, This Year, All Time
- View total revenue, total orders, and average per order
- Daily breakdown table

### Transaction History
- Complete audit trail of all activities
- Filter by transaction type
- Export to Excel
- Timestamp for each transaction

### Database Management
- Export individual tables to Excel
- Export complete database (multi-sheet Excel file)
- Download JSON backup
- Reset database to default state

## 🚀 How to Use

### Getting Started
1. Open `index.html` in a web browser
2. The dashboard will load with default menu items
3. All data is stored in browser's localStorage

### Creating an Order
1. Go to **Menu** page
2. Browse items and click "Add to Cart"
3. Enter customer details (Name and Phone are required)
4. Click "Confirm & Save Order"

### Managing Orders
1. Go to **Orders** page
2. Select orders using checkboxes
3. Click "Mark Selected Complete" to finalize orders
4. Click "Generate Bill" to print a receipt

### Updating Stock
1. Go to **Stock** page
2. Select an item using checkbox
3. Click "Update Selected Stock"
4. Enter quantity to add
5. Stock history is automatically logged

### Viewing History
1. Go to **History** page
2. Use filter buttons to view specific transaction types
3. Click "Export History to Excel" to download
4. All timestamps are in Indian Standard Time format

### Exporting Data
1. Go to **Database** page
2. Choose which data to export:
   - Individual tables (Menu, Orders, Customers, etc.)
   - Complete database (all tables in one file)
3. Files are downloaded as `.xlsx` format
4. Filenames include the current date

### Backing Up Data
1. Go to **Database** page
2. Click "Download Backup (JSON)"
3. Save the JSON file safely
4. This file contains all your data and can be used for restoration

## 📁 File Structure

```
Chai-Ki-Chuski/
│
├── index.html          # Main HTML structure with all pages
├── style.css           # Styling and layout
├── script.js           # All JavaScript functionality
└── README.md           # This file
```

## 💾 Data Storage

All data is stored in the browser's localStorage:
- **menu**: Menu items with stock levels
- **orders**: All customer orders
- **customers**: Customer database
- **revenue**: Revenue records
- **transactionHistory**: Complete transaction log
- **stockHistory**: Stock update history
- **nextCustomerId**: Auto-increment counter
- **nextOrderId**: Auto-increment counter

## 📊 Excel Export Features

### What Gets Exported:

**Menu Export:**
- ID, Category, Item Name, Price, Stock

**Orders Export:**
- Order ID, Customer Name, Phone, Email, Items, Total, Status, Date, Time

**Customers Export:**
- Customer ID, Name, Phone, Email

**Revenue Export:**
- Order ID, Amount, Revenue Date, Items

**Stock History Export:**
- Timestamp, Item ID, Item Name, Old Stock, New Stock, Change

**Complete Database:**
- All of the above in a single Excel file with multiple sheets

## 🎨 Color Coding

- **Orders**: Green border
- **Stock Updates**: Orange border
- **Revenue**: Blue border
- **Completed Orders**: Light green background
- **Pending Orders**: Light orange background

## ⚙️ Technical Details

- **Framework**: Pure HTML/CSS/JavaScript (No external frameworks)
- **Storage**: Browser localStorage
- **Excel Generation**: SheetJS (xlsx.js) library
- **Date Format**: ISO 8601 (YYYY-MM-DD)
- **Currency**: Indian Rupees (₹)
- **Time Zone**: Indian Standard Time

## 🔒 Data Privacy

- All data is stored locally in your browser
- No data is sent to any server
- Clearing browser data will delete all records
- Always keep backups of important data

## 📝 Important Notes

1. **Browser Storage Limit**: localStorage has a ~5-10MB limit per domain
2. **Data Persistence**: Data persists until you clear browser data or reset the database
3. **Backups**: Regularly export data or download JSON backups
4. **Excel Files**: All exports include the current date in filename
5. **History Limit**: Transaction history is limited to last 1000 entries

## 🆘 Troubleshooting

**Orders not showing?**
- Check if you've created any orders from the Menu page

**Excel export not working?**
- Ensure you have data to export
- Check if pop-ups are blocked in your browser

**Data lost?**
- Check if browser data was cleared
- Restore from JSON backup if available

**Bill not printing?**
- Allow pop-ups for the site
- Select exactly one order before generating bill

## 🎯 Future Enhancement Ideas

- Import data from Excel files
- Advanced analytics and charts
- Customer loyalty program
- Email bill to customers
- Multi-user support
- Data sync across devices
- Dark mode theme

## 📞 Support

For any issues or suggestions, please check:
1. Browser console for error messages
2. Ensure all files (HTML, CSS, JS) are in the same directory
3. Use a modern browser (Chrome, Firefox, Edge, Safari)

---

**Version**: 2.0
**Last Updated**: January 2026
**Made with ☕ and ❤️**
