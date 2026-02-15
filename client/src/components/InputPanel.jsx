import { useState } from 'react'


// Note: Using standard <i> tags for simplicity matching previous CSS, 
// ensuring FontAwesome is loaded in index.html

export default function InputPanel({ availableItems, addItem, customer, setCustomer }) {
    const [selectedItem, setSelectedItem] = useState('')
    const [qty, setQty] = useState(1)
    const [customName, setCustomName] = useState('')
    const [customPrice, setCustomPrice] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        let name = ''
        let price = 0
        let total = 0

        if (selectedItem === 'Other') {
            name = customName
            price = parseFloat(customPrice)
        } else {
            const item = availableItems.find(i => i.ItemName === selectedItem)
            if (item) {
                name = item.ItemName
                price = item.UnitPrice
            }
        }

        if (!name || isNaN(price) || price < 0) return alert('Invalid Item')

        addItem({ name, price, qty, total: price * qty })

        // Reset
        setQty(1)
        if (selectedItem === 'Other') {
            setCustomName('')
            setCustomPrice('')
        }
    }

    return (
        <section className="panel input-panel glass">
            <header className="panel-header">
                <div className="logo-area">
                    <i className="fa-solid fa-soap"></i>
                    <h1>FreshWash</h1>
                </div>
                <p>New Laundry Order</p>
            </header>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Item Type</label>
                    <div className="select-wrapper">
                        <select
                            value={selectedItem}
                            onChange={(e) => setSelectedItem(e.target.value)}
                            required
                        >
                            <option value="" disabled>Select Item...</option>
                            {availableItems.map(item => (
                                <option key={item.ItemID} value={item.ItemName}>
                                    {item.ItemName} (₹{(item.UnitPrice || 0).toFixed(2)})
                                </option>
                            ))}
                            <option value="Other">Other (Custom)</option>
                        </select>
                        <i className="fa-solid fa-chevron-down"></i>
                    </div>
                </div>

                {selectedItem === 'Other' && (
                    <div className="form-row">
                        <div className="form-group">
                            <label>Item Name</label>
                            <input type="text" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="e.g. Scarf" required />
                        </div>
                        <div className="form-group">
                            <label>Price (₹)</label>
                            <input type="number" value={customPrice} onChange={e => setCustomPrice(e.target.value)} placeholder="0.00" step="0.50" required />
                        </div>
                    </div>
                )}

                <div className="form-row">
                    <div className="form-group">
                        <label>Quantity</label>
                        <div className="quantity-control">
                            <button type="button" className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}><i className="fa-solid fa-minus"></i></button>
                            <input type="number" readOnly value={qty} />
                            <button type="button" className="qty-btn" onClick={() => setQty(qty + 1)}><i className="fa-solid fa-plus"></i></button>
                        </div>
                    </div>
                    <div className="form-group">
                        <button type="submit" className="btn-primary">
                            <i className="fa-solid fa-plus"></i> Add to Bill
                        </button>
                    </div>
                </div>
            </form>

            <div className="customer-details">
                <h3>Customer Info</h3>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Customer Name"
                        value={customer.name}
                        onChange={e => setCustomer({ ...customer, name: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Phone Number (10 digits)"
                        value={customer.phone}
                        maxLength={10}
                        onChange={e => {
                            const value = e.target.value.replace(/\D/g, '');
                            setCustomer({ ...customer, phone: value });
                        }}
                    />
                </div>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Town / Village"
                        value={customer.town || ''}
                        onChange={e => setCustomer({ ...customer, town: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '5px', display: 'block' }}>Return Date</label>
                    <input
                        type="date"
                        value={customer.returnDate || ''}
                        onChange={e => setCustomer({ ...customer, returnDate: e.target.value })}
                    />
                </div>
            </div>
        </section>
    )
}
