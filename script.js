// --- 1. INITIAL DATA STRUCTURES & LOCAL STORAGE ---

const DEFAULT_MENU = [
    { id: 1, category: "Chai", item_name: "Masala Chai", price: 30, stock: 50 },
    { id: 2, category: "Chai", item_name: "Ginger Chai", price: 35, stock: 45 },
    { id: 3, category: "Snacks", item_name: "Samosa", price: 20, stock: 60 },
    { id: 4, category: "Drinks", item_name: "Lassi", price: 60, stock: 30 },
];

let menu = JSON.parse(localStorage.getItem('menu')) || DEFAULT_MENU;
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let customers = JSON.parse(localStorage.getItem('customers')) || [];
let revenue = JSON.parse(localStorage.getItem('revenue')) || [];
let transactionHistory = JSON.parse(localStorage.getItem('transactionHistory')) || [];
let stockHistory = JSON.parse(localStorage.getItem('stockHistory')) || [];
let currentCart = [];
let nextCustomerId = JSON.parse(localStorage.getItem('nextCustomerId')) || 1;
let nextOrderId = JSON.parse(localStorage.getItem('nextOrderId')) || 1;
let nextMenuItemId = menu.length > 0 ? Math.max(...menu.map(i => i.id)) + 1 : 1;


function updateLocalStorage() {
    localStorage.setItem('menu', JSON.stringify(menu));
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('customers', JSON.stringify(customers));
    localStorage.setItem('revenue', JSON.stringify(revenue));
    localStorage.setItem('transactionHistory', JSON.stringify(transactionHistory));
    localStorage.setItem('stockHistory', JSON.stringify(stockHistory));
    localStorage.setItem('nextCustomerId', nextCustomerId);
    localStorage.setItem('nextOrderId', nextOrderId);
}

// --- 2. TRANSACTION HISTORY MANAGEMENT ---

function addToHistory(type, details) {
    const timestamp = new Date().toISOString();
    const entry = {
        id: Date.now(),
        timestamp,
        type, // 'order', 'stock', 'revenue', 'menu'
        details
    };
    transactionHistory.unshift(entry); // Add to beginning
    
    // Keep only last 1000 entries
    if (transactionHistory.length > 1000) {
        transactionHistory = transactionHistory.slice(0, 1000);
    }
    
    updateLocalStorage();
}

// --- 3. GLOBAL UTILITIES ---

function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

function getWeekStart(date) {
    const d = new Date(date);
    d.setDate(d.getDate() - (d.getDay() === 0 ? 6 : d.getDay() - 1));
    return d.toISOString().split('T')[0];
}

function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// --- 4. PAGE ROUTING & INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    // Set up navigation
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = e.target.getAttribute('data-page');
            switchPage(targetPage);
        });
    });

    // Initialize the starting page
    switchPage('menu');
});

function switchPage(pageId) {
    document.querySelectorAll('.page-content').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    
    document.querySelectorAll('.nav-button').forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-page') === pageId) {
            button.classList.add('active');
        }
    });

    // Run the specific renderer for the page
    if (pageId === 'menu') renderMenu();
    if (pageId === 'orders') renderOrders();
    if (pageId === 'stock') renderStock();
    if (pageId === 'revenue') renderRevenue('all');
    if (pageId === 'history') renderHistory('all');
    if (pageId === 'database') renderDatabase();
}

// --- 5. MENU/ORDERING LOGIC ---

function renderMenu() {
    const menuContainer = document.getElementById('menu-container');
    menuContainer.innerHTML = ''; 
    const categorizedMenu = menu.reduce((acc, item) => {
        acc[item.category] = acc[item.category] || [];
        acc[item.category].push(item);
        return acc;
    }, {});

    for (const category in categorizedMenu) {
        let categoryHtml = `<h3>${category}</h3>`;
        categorizedMenu[category].forEach(item => {
            const isOutOfStock = item.stock <= 0;
            const stockText = isOutOfStock ? 
                `<span class="out-of-stock">Out of Stock</span>` : 
                `Avail: ${item.stock}`;

            categoryHtml += `
                <div class="menu-item">
                    <div class="item-info">
                        <strong>${item.item_name}</strong>
                        <span> (₹${item.price.toFixed(2)})</span>
                        <p style="margin: 0; font-size: 0.9em;">${stockText}</p>
                    </div>
                    <button class="add-button" data-id="${item.id}" ${isOutOfStock ? 'disabled' : ''}>
                        Add to Cart
                    </button>
                </div>
            `;
        });
        menuContainer.innerHTML += categoryHtml;
    }
    renderCart();
}

function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    let total = 0;
    
    cartItemsContainer.innerHTML = ''; 

    if (currentCart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Cart is empty.</p>';
        cartTotalSpan.textContent = '₹0.00';
        return;
    }

    currentCart.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;

        const cartItemHtml = `
            <p style="display: flex; justify-content: space-between;">
                <span>${index + 1}. ${item.name} x${item.qty}</span> 
                <strong>₹${itemTotal.toFixed(2)}</strong>
            </p>
        `;
        cartItemsContainer.innerHTML += cartItemHtml;
    });

    cartTotalSpan.textContent = `₹${total.toFixed(2)}`;
}

function addToCart(itemId) {
    const item = menu.find(i => i.id === itemId);

    if (!item || item.stock <= 0) {
        alert("Item is out of stock or not found.");
        return;
    }

    const existingCartItem = currentCart.find(i => i.id === itemId);

    if (existingCartItem) {
        if (existingCartItem.qty + 1 > item.stock) {
            alert(`Not enough stock. Available: ${item.stock}`);
            return;
        }
        existingCartItem.qty += 1; 
    } else {
        currentCart.push({
            id: item.id,
            name: item.item_name,
            price: item.price,
            qty: 1
        });
    }
    
    renderCart();
}

document.getElementById('menu-container').addEventListener('click', (event) => {
    if (event.target.classList.contains('add-button')) {
        const itemId = parseInt(event.target.getAttribute('data-id'));
        addToCart(itemId);
    }
});

document.getElementById('confirm-order-button').addEventListener('click', () => {
    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const email = document.getElementById('customer-email').value.trim();
    
    if (!name || !phone) {
        alert("Name and Phone are required!");
        return;
    }
    if (currentCart.length === 0) {
        alert("Cart is empty!");
        return;
    }

    // 1. Save Customer
    const customer = { id: nextCustomerId++, name, phone, email };
    customers.push(customer);
    
    // 2. Process Stock & Items Summary
    const itemsSummary = currentCart.map(cartItem => {
        const menuItem = menu.find(i => i.id === cartItem.id);
        
        if (menuItem) menuItem.stock -= cartItem.qty; 
        
        return `${cartItem.name} x${cartItem.qty}`;
    }).join(', ');
    
    const total = currentCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    // 3. Save Order
    const newOrder = {
        id: nextOrderId++,
        customer_id: customer.id,
        items: itemsSummary,
        status: "Pending",
        total: parseFloat(total.toFixed(2)),
        order_date: getTodayDate(),
        order_time: new Date().toTimeString().slice(0, 8)
    };
    orders.push(newOrder);
    
    // 4. Add to history
    addToHistory('order', {
        orderId: newOrder.id,
        customerName: customer.name,
        items: itemsSummary,
        total: newOrder.total
    });
    
    updateLocalStorage();
    
    // Clear form and cart
    document.getElementById('customer-name').value = '';
    document.getElementById('customer-phone').value = '';
    document.getElementById('customer-email').value = '';
    currentCart = [];
    
    renderMenu();
    alert(`Order #${newOrder.id} placed successfully!`);
});

// --- 6. ORDERS PAGE ---

function renderOrders() {
    const container = document.getElementById('orders-table-container');
    container.innerHTML = '';
    
    if (orders.length === 0) {
        container.innerHTML = '<p class="empty-state">No orders yet. Create your first order from the Menu page!</p>';
        return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Select</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total (₹)</th>
                <th>Status</th>
                <th>Date</th>
            </tr>
        </thead>
        <tbody id="orders-tbody"></tbody>
    `;
    container.appendChild(table);

    const tbody = document.getElementById('orders-tbody');
    
    orders.slice().reverse().forEach(order => {
        const customer = customers.find(c => c.id === order.customer_id);
        const row = document.createElement('tr');
        row.className = `status-${order.status}`;
        row.innerHTML = `
            <td><input type="checkbox" class="order-select" data-id="${order.id}"></td>
            <td>${order.id}</td>
            <td>${customer ? customer.name : 'Unknown'}</td>
            <td>${order.items}</td>
            <td>₹${order.total.toFixed(2)}</td>
            <td>${order.status}</td>
            <td>${order.order_date}</td>
        `;
        tbody.appendChild(row);
    });
}

document.getElementById('mark-complete-button').addEventListener('click', () => {
    const selectedOrders = Array.from(document.querySelectorAll('.order-select:checked'))
        .map(cb => parseInt(cb.getAttribute('data-id')));
        
    if (selectedOrders.length === 0) {
        alert("Please select at least one order to mark as complete.");
        return;
    }
    
    selectedOrders.forEach(orderId => {
        const order = orders.find(o => o.id === orderId);
        if (order && order.status === 'Pending') {
            order.status = 'Completed';
            
            // Add to revenue
            revenue.push({
                order_id: order.id,
                amount: order.total,
                revenue_date: getTodayDate()
            });
            
            // Add to history
            addToHistory('revenue', {
                orderId: order.id,
                amount: order.total,
                status: 'Completed'
            });
        }
    });
    
    updateLocalStorage();
    renderOrders();
    alert(`${selectedOrders.length} order(s) marked as complete!`);
});

// --- 7. STOCK MANAGEMENT ---

function renderStock() {
    const container = document.getElementById('stock-table-container');
    container.innerHTML = '';
    
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Select</th>
                <th>ID</th>
                <th>Category</th>
                <th>Item Name</th>
                <th>Price (₹)</th>
                <th>Stock</th>
            </tr>
        </thead>
        <tbody id="stock-tbody"></tbody>
    `;
    container.appendChild(table);

    const tbody = document.getElementById('stock-tbody');
    
    menu.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" class="stock-select" data-id="${item.id}"></td>
            <td>${item.id}</td>
            <td>${item.category}</td>
            <td>${item.item_name}</td>
            <td>₹${item.price.toFixed(2)}</td>
            <td>${item.stock}</td>
        `;
        tbody.appendChild(row);
    });
}

let currentStockItemId = null;

document.getElementById('update-stock-button').addEventListener('click', () => {
    const selectedItems = Array.from(document.querySelectorAll('.stock-select:checked'))
        .map(cb => parseInt(cb.getAttribute('data-id')));
        
    if (selectedItems.length !== 1) {
        alert("Please select exactly one item to update stock.");
        return;
    }
    
    currentStockItemId = selectedItems[0];
    const item = menu.find(i => i.id === currentStockItemId);
    
    document.getElementById('modal-stock-name').textContent = item.item_name;
    document.getElementById('modal-stock-increase').value = '';
    document.getElementById('modal-stock').style.display = 'block';
});

document.getElementById('modal-stock-save').addEventListener('click', () => {
    const increase = parseInt(document.getElementById('modal-stock-increase').value);
    
    if (isNaN(increase) || increase < 1) {
        alert("Please enter a valid quantity.");
        return;
    }
    
    const item = menu.find(i => i.id === currentStockItemId);
    const oldStock = item.stock;
    item.stock += increase;
    
    // Add to stock history
    stockHistory.push({
        timestamp: new Date().toISOString(),
        itemId: item.id,
        itemName: item.item_name,
        oldStock: oldStock,
        newStock: item.stock,
        change: increase
    });
    
    // Add to history
    addToHistory('stock', {
        itemName: item.item_name,
        oldStock: oldStock,
        newStock: item.stock,
        change: increase
    });
    
    updateLocalStorage();
    renderStock();
    
    document.getElementById('modal-stock').style.display = 'none';
    alert(`Stock updated! ${item.item_name}: ${oldStock} → ${item.stock}`);
});

document.getElementById('add-menu-item-button').addEventListener('click', () => {
    document.getElementById('add-item-name').value = '';
    document.getElementById('add-item-price').value = '';
    document.getElementById('add-item-stock').value = '';
    document.getElementById('modal-add-item').style.display = 'block';
});

document.getElementById('modal-add-item-save').addEventListener('click', () => {
    const name = document.getElementById('add-item-name').value.trim();
    const category = document.getElementById('add-item-category').value;
    const price = parseFloat(document.getElementById('add-item-price').value);
    const stock = parseInt(document.getElementById('add-item-stock').value);
    
    if (!name || isNaN(price) || price <= 0 || isNaN(stock) || stock < 0) {
        alert("Please fill in all fields correctly.");
        return;
    }
    
    const newItem = {
        id: nextMenuItemId++,
        category,
        item_name: name,
        price,
        stock
    };
    
    menu.push(newItem);
    
    // Add to history
    addToHistory('menu', {
        action: 'add',
        itemName: name,
        category: category,
        price: price,
        stock: stock
    });
    
    updateLocalStorage();
    renderStock();
    
    document.getElementById('modal-add-item').style.display = 'none';
    alert(`${name} added to menu!`);
});

// Close modals
document.querySelectorAll('.close-button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    });
});

window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});

// --- 8. REVENUE PAGE ---

document.getElementById('revenue-filters').addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        document.querySelectorAll('#revenue-filters button').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        renderRevenue(e.target.getAttribute('data-period'));
    }
});

function renderRevenue(period) {
    const today = new Date();
    let startDate = null;
    let endDate = today;

    if (period === 'today') {
        startDate = today;
    } else if (period === 'yesterday') {
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 1);
        endDate = startDate;
    } else if (period === 'week') {
        startDate = new Date(getWeekStart(today));
    } else if (period === 'month') {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (period === 'year') {
        startDate = new Date(today.getFullYear(), 0, 1);
    }
    
    const filteredRevenue = revenue.filter(r => {
        if (period === 'all') return true;
        
        const revDate = new Date(r.revenue_date);
        const s = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const e = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        const rD = new Date(revDate.getFullYear(), revDate.getMonth(), revDate.getDate());

        return rD >= s && rD <= e;
    });

    const dailyRevenue = filteredRevenue.reduce((acc, item) => {
        acc[item.revenue_date] = acc[item.revenue_date] || { amount: 0, orders: 0 };
        acc[item.revenue_date].amount += item.amount;
        acc[item.revenue_date].orders += 1;
        return acc;
    }, {});
    
    const totalRevenue = filteredRevenue.reduce((sum, r) => sum + r.amount, 0);
    const totalOrders = filteredRevenue.length;
    const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const statsHtml = `
        <h4>📊 ${period.charAt(0).toUpperCase() + period.slice(1)} Revenue</h4>
        <p style="font-size: 1.2em; font-weight: bold; color: #60ea2e;">Total Revenue: ₹${totalRevenue.toFixed(2)}</p>
        <p>Total Orders: ${totalOrders}</p>
        <p>Average per Order: ₹${avgOrder.toFixed(2)}</p>
    `;
    document.getElementById('revenue-stats').innerHTML = statsHtml;
    
    const container = document.getElementById('revenue-table-container');
    container.innerHTML = '';
    
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Date</th>
                <th>Orders</th>
                <th>Revenue (₹)</th>
            </tr>
        </thead>
        <tbody id="revenue-tbody"></tbody>
    `;
    container.appendChild(table);

    const tbody = document.getElementById('revenue-tbody');
    const sortedDates = Object.keys(dailyRevenue).sort((a, b) => new Date(b) - new Date(a));

    sortedDates.forEach(date => {
        const data = dailyRevenue[date];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${date}</td>
            <td>${data.orders}</td>
            <td>₹${data.amount.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    });
}

// --- 9. TRANSACTION HISTORY PAGE ---

document.getElementById('history-filters').addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        document.querySelectorAll('#history-filters button').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        renderHistory(e.target.getAttribute('data-filter'));
    }
});

function renderHistory(filter) {
    const container = document.getElementById('history-container');
    container.innerHTML = '';
    
    let filteredHistory = transactionHistory;
    
    if (filter === 'orders') {
        filteredHistory = transactionHistory.filter(h => h.type === 'order');
    } else if (filter === 'stock') {
        filteredHistory = transactionHistory.filter(h => h.type === 'stock');
    } else if (filter === 'revenue') {
        filteredHistory = transactionHistory.filter(h => h.type === 'revenue');
    }
    
    if (filteredHistory.length === 0) {
        container.innerHTML = '<p class="empty-state">No transaction history available.</p>';
        return;
    }
    
    filteredHistory.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = `history-entry type-${entry.type}`;
        
        let detailsHtml = '';
        
        if (entry.type === 'order') {
            detailsHtml = `
                <strong>Order #${entry.details.orderId}</strong> created<br>
                Customer: ${entry.details.customerName}<br>
                Items: ${entry.details.items}<br>
                Total: ₹${entry.details.total.toFixed(2)}
            `;
        } else if (entry.type === 'stock') {
            detailsHtml = `
                <strong>Stock Updated:</strong> ${entry.details.itemName}<br>
                ${entry.details.oldStock} → ${entry.details.newStock} 
                (${entry.details.change > 0 ? '+' : ''}${entry.details.change})
            `;
        } else if (entry.type === 'revenue') {
            detailsHtml = `
                <strong>Order #${entry.details.orderId}</strong> marked as ${entry.details.status}<br>
                Revenue: ₹${entry.details.amount.toFixed(2)}
            `;
        } else if (entry.type === 'menu') {
            detailsHtml = `
                <strong>Menu Item ${entry.details.action === 'add' ? 'Added' : 'Modified'}:</strong> ${entry.details.itemName}<br>
                Category: ${entry.details.category}<br>
                Price: ₹${entry.details.price} | Stock: ${entry.details.stock}
            `;
        }
        
        entryDiv.innerHTML = `
            <div class="history-entry-header">
                <span class="history-entry-type">${entry.type.toUpperCase()}</span>
                <span class="history-entry-time">${formatDateTime(entry.timestamp)}</span>
            </div>
            <div class="history-entry-details">
                ${detailsHtml}
            </div>
        `;
        
        container.appendChild(entryDiv);
    });
}

document.getElementById('export-history-button').addEventListener('click', () => {
    exportToExcel(transactionHistory, 'Transaction_History');
});

document.getElementById('clear-history-button').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all transaction history? This cannot be undone.')) {
        transactionHistory = [];
        updateLocalStorage();
        renderHistory('all');
        alert('Transaction history cleared.');
    }
});

// --- 10. DATABASE/EXCEL EXPORT FUNCTIONS ---

function renderDatabase() {
    // Just a placeholder - the page is already set up in HTML
}

function exportToExcel(data, filename) {
    if (!data || data.length === 0) {
        alert('No data to export!');
        return;
    }
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${filename}_${getTodayDate()}.xlsx`);
}

function exportMenuToExcel() {
    const menuData = menu.map(item => ({
        'ID': item.id,
        'Category': item.category,
        'Item Name': item.item_name,
        'Price (₹)': item.price,
        'Stock': item.stock
    }));
    
    exportToExcel(menuData, 'Chai_Ki_Chuski_Menu');
}


function exportOrdersToExcel() {
    const ordersData = orders.map(order => {
        const customer = customers.find(c => c.id === order.customer_id);
        return {
            'Order ID': order.id,
            'Customer Name': customer ? customer.name : 'Unknown',
            'Customer Phone': customer ? customer.phone : '',
            'Customer Email': customer ? customer.email : '',
            'Items': order.items,
            'Total (₹)': order.total,
            'Status': order.status,
            'Order Date': order.order_date,
            'Order Time': order.order_time || ''
        };
    });
    exportToExcel(ordersData, 'Chai_Ki_Chuski_Orders');
}

function exportCustomersToExcel() {
    const customersData = customers.map(c => ({
        'Customer ID': c.id,
        'Name': c.name,
        'Phone': c.phone,
        'Email': c.email || ''
    }));
    exportToExcel(customersData, 'Chai_Ki_Chuski_Customers');
}

function exportRevenueToExcel() {
    const revenueData = revenue.map(r => {
        const order = orders.find(o => o.id === r.order_id);
        return {
            'Order ID': r.order_id,
            'Amount (₹)': r.amount,
            'Revenue Date': r.revenue_date,
            'Items': order ? order.items : ''
        };
    });
    exportToExcel(revenueData, 'Chai_Ki_Chuski_Revenue');
}

function exportStockHistoryToExcel() {
    const stockData = stockHistory.map(s => ({
        'Timestamp': formatDateTime(s.timestamp),
        'Item ID': s.itemId,
        'Item Name': s.itemName,
        'Old Stock': s.oldStock,
        'New Stock': s.newStock,
        'Change': s.change
    }));
    exportToExcel(stockData, 'Chai_Ki_Chuski_Stock_History');
}

function exportAllData() {
    const wb = XLSX.utils.book_new();
    
    // Menu Sheet
    const menuData = menu.map(item => ({
        'ID': item.id,
        'Category': item.category,
        'Item Name': item.item_name,
        'Price (₹)': item.price,
        'Stock': item.stock
    }));
    const wsMenu = XLSX.utils.json_to_sheet(menuData);
    XLSX.utils.book_append_sheet(wb, wsMenu, "Menu");
    
    // Orders Sheet
    const ordersData = orders.map(order => {
        const customer = customers.find(c => c.id === order.customer_id);
        return {
            'Order ID': order.id,
            'Customer': customer ? customer.name : '',
            'Phone': customer ? customer.phone : '',
            'Items': order.items,
            'Total': order.total,
            'Status': order.status,
            'Date': order.order_date
        };
    });
    const wsOrders = XLSX.utils.json_to_sheet(ordersData);
    XLSX.utils.book_append_sheet(wb, wsOrders, "Orders");
    
    // Customers Sheet
    const customersData = customers.map(c => ({
        'ID': c.id,
        'Name': c.name,
        'Phone': c.phone,
        'Email': c.email || ''
    }));
    const wsCustomers = XLSX.utils.json_to_sheet(customersData);
    XLSX.utils.book_append_sheet(wb, wsCustomers, "Customers");
    
    // Revenue Sheet
    const revenueData = revenue.map(r => ({
        'Order ID': r.order_id,
        'Amount': r.amount,
        'Date': r.revenue_date
    }));
    const wsRevenue = XLSX.utils.json_to_sheet(revenueData);
    XLSX.utils.book_append_sheet(wb, wsRevenue, "Revenue");
    
    // Stock History Sheet
    if (stockHistory.length > 0) {
        const stockData = stockHistory.map(s => ({
            'Timestamp': formatDateTime(s.timestamp),
            'Item': s.itemName,
            'Old Stock': s.oldStock,
            'New Stock': s.newStock,
            'Change': s.change
        }));
        const wsStock = XLSX.utils.json_to_sheet(stockData);
        XLSX.utils.book_append_sheet(wb, wsStock, "Stock History");
    }
    
    XLSX.writeFile(wb, `Chai_Ki_Chuski_Complete_Database_${getTodayDate()}.xlsx`);
}

function downloadBackup() {
    const backup = {
        menu,
        orders,
        customers,
        revenue,
        transactionHistory,
        stockHistory,
        nextCustomerId,
        nextOrderId,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Chai_Ki_Chuski_Backup_${getTodayDate()}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

function resetDatabase() {
    if (confirm('⚠️ WARNING: This will DELETE ALL DATA and reset to default menu items. This cannot be undone!\n\nAre you absolutely sure?')) {
        if (confirm('Last chance! Click OK to confirm complete data reset.')) {
            localStorage.clear();
            menu = [...DEFAULT_MENU];
            orders = [];
            customers = [];
            revenue = [];
            transactionHistory = [];
            stockHistory = [];
            currentCart = [];
            nextCustomerId = 1;
            nextOrderId = 1;
            nextMenuItemId = DEFAULT_MENU.length + 1;
            
            updateLocalStorage();
            switchPage('menu');
            alert('Database has been reset to default state.');
        }
    }
}

// Event Listeners for Database Page
document.getElementById('export-menu-button').addEventListener('click', exportMenuToExcel);
document.getElementById('export-orders-button').addEventListener('click', exportOrdersToExcel);
document.getElementById('export-customers-button').addEventListener('click', exportCustomersToExcel);
document.getElementById('export-revenue-button').addEventListener('click', exportRevenueToExcel);
document.getElementById('export-stock-history-button').addEventListener('click', exportStockHistoryToExcel);
document.getElementById('export-all-button').addEventListener('click', exportAllData);
document.getElementById('backup-database-button').addEventListener('click', downloadBackup);
document.getElementById('reset-database-button').addEventListener('click', resetDatabase);

// --- 11. BILL GENERATION ---

document.getElementById('generate-bill-button').addEventListener('click', () => {
    const selectedOrders = Array.from(document.querySelectorAll('.order-select:checked'))
        .map(cb => parseInt(cb.getAttribute('data-id')));
        
    if (selectedOrders.length !== 1) {
        alert("Select exactly one order to generate a bill.");
        return;
    }
    
    const order = orders.find(o => o.id === selectedOrders[0]);
    const customer = customers.find(c => c.id === order.customer_id);

    const itemsArray = order.items.split(', ').map(itemStr => {
        const parts = itemStr.split(' x');
        const name = parts[0];
        const qty = parseInt(parts[1] || 1);
        const itemDetails = menu.find(i => i.item_name === name);
        const price = itemDetails ? itemDetails.price : 0;
        return { name, qty, price, total: price * qty };
    });

    let itemsHtml = itemsArray.map(item => `
        <tr style="border-top: 1px solid #ccc;">
            <td style="text-align: left;">${item.name}</td>
            <td>${item.price.toFixed(2)}</td>
            <td>${item.qty}</td>
            <td style="text-align: right;">${item.total.toFixed(2)}</td>
        </tr>
    `).join('');

    const billHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Bill #${order.id}</title>
            <style>
                body { font-family: 'Courier New', monospace; margin: 0; padding: 20px; color: #333; }
                .bill-container { width: 300px; margin: 0 auto; border: 1px dashed #333; padding: 10px; }
                h1 { text-align: center; font-size: 1.2em; margin-bottom: 5px; }
                .line { border-bottom: 1px solid #333; margin: 10px 0; }
                table { width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 0.9em; }
                th, td { padding: 3px 0; text-align: center; }
                .total-row { font-weight: bold; font-size: 1.1em; }
                @media print {
                    @page { margin: 0.5cm; }
                    body { margin: 0; }
                    .bill-container { border: none; }
                }
            </style>
        </head>
        <body>
            <div class="bill-container">
                <h1>CHAI KI CHUSKI</h1>
                <p style="text-align: center; margin-top: 0;">A Warm Cuppa for a Warm Heart</p>
                <div class="line"></div>
                <p>Name: ${customer.name}</p>
                <p>Phone: ${customer.phone}</p>
                <p>Email: ${customer.email || 'N/A'}</p>
                <p>Order ID: ${order.id}</p>
                <p>Date: ${order.order_date}</p>
                <div class="line"></div>
                
                <table>
                    <thead>
                        <tr>
                            <th style="text-align: left;">Item</th>
                            <th>Rate</th>
                            <th>Qty</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
                <div class="line"></div>

                <table style="font-size: 1em;">
                    <tr class="total-row">
                        <td colspan="3" style="text-align: left; padding: 5px 0;">TOTAL:</td>
                        <td style="text-align: right;">₹${order.total.toFixed(2)}</td>
                    </tr>
                </table>

                <div class="line"></div>
                <p style="text-align: center; font-size: 0.8em;">Thank you!</p>
                <p style="text-align: center; font-size: 0.8em;">Visit again</p>
            </div>
            <script>
                window.onload = function() {
                    setTimeout(() => {
                        window.print();
                    }, 200);
                }
            </script>
        </body>
        </html>
    `;
    
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
        printWindow.document.write(billHtml);
        printWindow.document.close();
    } else {
        alert("Could not open a new window. Please allow popups for this site to print the bill.");
    }
});
