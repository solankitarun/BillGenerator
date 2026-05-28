document.addEventListener('DOMContentLoaded', () => {
    // Current State
    let billItems = [];
    const taxRate = 0.05; // 5% tax

    // DOM Elements
    const form = document.getElementById('addItemForm');
    const itemSelect = document.getElementById('itemSelect');
    const customItemRow = document.getElementById('customItemRow');
    const customNameInput = document.getElementById('customName');
    const customPriceInput = document.getElementById('customPrice');
    const quantityInput = document.getElementById('quantity');
    const billItemsContainer = document.getElementById('billItems');
    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('tax');
    const grandTotalEl = document.getElementById('grandTotal');
    const customerNameInput = document.getElementById('customerName');
    const customerPhoneInput = document.getElementById('customerPhone');

    // Initialize Date and Invoice Number
    document.getElementById('billDate').textContent = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
    document.getElementById('invoiceNum').textContent = '#FW-' + Math.floor(1000 + Math.random() * 9000);

    // Event Listeners
    itemSelect.addEventListener('change', (e) => {
        if (e.target.value === 'Other') {
            customItemRow.classList.remove('hidden');
            customNameInput.required = true;
            customPriceInput.required = true;
        } else {
            customItemRow.classList.add('hidden');
            customNameInput.required = false;
            customPriceInput.required = false;
        }
    });

    // Mirror Customer Info
    const updateCustomerInfo = () => {
        document.getElementById('displayCustomerName').textContent = customerNameInput.value || 'Guest';
        document.getElementById('displayCustomerPhone').textContent = customerPhoneInput.value;
    };
    customerNameInput.addEventListener('input', updateCustomerInfo);
    customerPhoneInput.addEventListener('input', updateCustomerInfo);

    // Form Submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        addItem();
    });

    // Add Item Logic
    function addItem() {
        const type = itemSelect.value;
        const qty = parseInt(quantityInput.value);
        let name = type;
        let price = 0;

        if (type === 'Other') {
            name = customNameInput.value;
            price = parseFloat(customPriceInput.value);
        } else {
            const option = itemSelect.options[itemSelect.selectedIndex];
            price = parseFloat(option.getAttribute('data-price'));
        }

        if (!name || isNaN(price) || price < 0) {
            alert('Please enter valid item details.');
            return;
        }

        const newItem = {
            id: Date.now(),
            name,
            price,
            qty,
            total: price * qty
        };

        billItems.push(newItem);
        renderBill();
        
        // Reset form for next item (keep customer info)
        quantityInput.value = 1;
        if (type === 'Other') {
            customNameInput.value = '';
            customPriceInput.value = '';
        }
    }

    // Render Bill Table
    window.renderBill = function() {
        billItemsContainer.innerHTML = '';
        let subtotal = 0;

        billItems.forEach(item => {
            subtotal += item.total;
            const tr = document.createElement('tr');
            tr.className = 'bill-item';
            tr.innerHTML = `
                <td>${item.name}</td>
                <td class="text-center">${item.qty}</td>
                <td class="text-right">$${item.price.toFixed(2)}</td>
                <td class="text-right">$${item.total.toFixed(2)}</td>
                <td class="text-right action-col">
                    <button class="delete-btn" onclick="removeItem(${item.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            billItemsContainer.appendChild(tr);
        });

        const tax = subtotal * taxRate;
        const total = subtotal + tax;

        subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        taxEl.textContent = `$${tax.toFixed(2)}`;
        grandTotalEl.textContent = `$${total.toFixed(2)}`;
    };

    // Remove Item
    window.removeItem = function(id) {
        billItems = billItems.filter(item => item.id !== id);
        renderBill();
    };

    // Adjust Quantity directly
    window.adjustQty = function(delta) {
        let current = parseInt(quantityInput.value);
        if (isNaN(current)) current = 1;
        current += delta;
        if (current < 1) current = 1;
        quantityInput.value = current;
    };

    // Reset Bill
    window.resetBill = function() {
        if(confirm('Are you sure you want to clear the current bill?')) {
            billItems = [];
            customerNameInput.value = '';
            customerPhoneInput.value = '';
            updateCustomerInfo();
            renderBill();
            // Refresh Invoice Number
            document.getElementById('invoiceNum').textContent = '#FW-' + Math.floor(1000 + Math.random() * 9000);
        }
    };

    // Print Bill
    window.printBill = function() {
        if (billItems.length === 0) {
            alert('Add items to the bill before printing.');
            return;
        }
        window.print();
    };
});
