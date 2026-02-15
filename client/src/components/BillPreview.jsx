import React, { useRef } from 'react'

export default function BillPreview({ shopDetails, customer, billItems, removeItem, invoiceNum, onReset, onPrint, setAlert, isEditing }) {
    const billRef = useRef();

    const subtotal = billItems.reduce((acc, item) => acc + item.total, 0)
    const taxRate = (shopDetails?.TaxRate !== undefined && shopDetails?.TaxRate !== null) ? shopDetails.TaxRate : 0.05
    const tax = subtotal * taxRate
    const total = subtotal + tax

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB'); // en-GB uses DD/MM/YYYY
    }

    const handleWhatsApp = () => {
        if (!customer.phone) return setAlert({ show: true, message: "Customer contact number is required!" });

        // Construct Text Summary
        let message = `*${shopDetails?.ShopName || 'FreshWash'} - Bill Summary*\n\n`;
        message += `*Customer:* ${customer.name || 'Guest'}\n`;
        message += `*Bill No:* ${invoiceNum}\n`;
        message += `*Date:* ${formatDate(new Date())}\n`;
        if (customer.returnDate) message += `*Return Date:* ${formatDate(customer.returnDate)}\n`;
        message += `\n*Items:*\n`;

        billItems.forEach(item => {
            message += `- ${item.name} (${item.qty}): ₹${item.total.toFixed(2)}\n`;
        });

        message += `\n*Subtotal:* ₹${subtotal.toFixed(2)}\n`;
        message += `*Tax:* ₹${tax.toFixed(2)}\n`;
        message += `*Grand Total: ₹${total.toFixed(2)}*\n\n`;
        message += `Thank you for choosing ${shopDetails?.ShopName}!`;

        const whatsappUrl = `https://wa.me/91${customer.phone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    return (
        <section className="panel bill-panel glass">
            <div className="bill-paper" ref={billRef}>
                <header className="bill-header">
                    <div className="brand">
                        <i className="fa-solid fa-droplet brand-icon"></i>
                        <div>
                            <h2>{shopDetails?.ShopName || 'Loading...'}</h2>
                            <p className="tagline">{shopDetails?.Tagline || 'Premium Laundry'}</p>
                            {shopDetails?.Address && <p className="shop-info">{shopDetails.Address}</p>}
                            {shopDetails?.Phone && <p className="shop-info"><i className="fa-solid fa-phone"></i> {shopDetails.Phone}</p>}
                        </div>
                    </div>
                    <div className="bill-meta">
                        <div className="meta-row">
                            <span className="label">Bill Number</span>
                            <span className="value">{invoiceNum}</span>
                        </div>
                        <div className="meta-row">
                            <span className="label">Date</span>
                            <span className="value">{formatDate(new Date())}</span>
                        </div>
                        {customer.returnDate && (
                            <div className="meta-row">
                                <span className="label">Return Date</span>
                                <span className="value">{formatDate(customer.returnDate)}</span>
                            </div>
                        )}
                    </div>
                </header>

                <div className="customer-section">
                    <p><strong>Bill To:</strong> {customer.name || 'Guest'}</p>
                    {customer.phone && <p>{customer.phone}</p>}
                    {customer.town && <p>{customer.town}</p>}
                </div>

                <div className="bill-table-container">
                    <table className="bill-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th className="text-center">Qty</th>
                                <th className="text-right">Price</th>
                                <th className="text-right">Total</th>
                                <th className="action-col"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {billItems.map(item => (
                                <tr key={item.id} className="bill-item">
                                    <td>{item.name}</td>
                                    <td className="text-center">{item.qty}</td>
                                    <td className="text-right">₹{item.price.toFixed(2)}</td>
                                    <td className="text-right">₹{item.total.toFixed(2)}</td>
                                    <td className="text-right action-col">
                                        <button className="delete-btn" onClick={() => removeItem(item.id)}>
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bill-footer">
                    <div className="totals">
                        <div className="total-row">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="total-row">
                            <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
                            <span>₹{tax.toFixed(2)}</span>
                        </div>
                        <div className="total-row grand-total">
                            <span>Total</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="signature-area">
                        <p>Thank you for choosing {shopDetails?.ShopName}!</p>
                    </div>
                </div>
            </div>

            <div className="actions">
                <button className="btn-secondary" onClick={onReset}>
                    <i className="fa-solid fa-rotate-left"></i> Reset
                </button>
                <button className="btn-whatsapp" onClick={handleWhatsApp}>
                    <i className="fa-brands fa-whatsapp"></i> WhatsApp
                </button>
                <button className="btn-success" onClick={onPrint}>
                    <i className="fa-solid fa-cloud-arrow-up"></i> {isEditing ? 'Update & Print' : 'Save & Print'}
                </button>
            </div>
        </section>
    )
}
