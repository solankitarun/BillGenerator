import React, { useState, useEffect } from 'react'
import api from '../api'
import '../App.css'

export default function Reports() {
    const [reportType, setReportType] = useState('transactions')
    const [data, setData] = useState([])
    const [selectedBillItems, setSelectedBillItems] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    const itemsPerPage = 8

    useEffect(() => {
        fetchReportData()
        setSearchTerm('')
        setCurrentPage(1)
    }, [reportType])

    const fetchReportData = async () => {
        setLoading(true)
        try {
            const endpoint = reportType === 'transactions'
                ? '/reports/financial'
                : reportType === 'monthly'
                    ? '/reports/monthly-sales'
                    : '/reports/overdue'

            const res = await api.get(endpoint)
            setData(res.data)
            setLoading(false)
        } catch (err) {
            console.error(`Error fetching ${reportType} report:`, err)
            setLoading(false)
        }
    }

    const fetchBillDetails = async (billId) => {
        try {
            const res = await api.get(`/bills/${billId}/items`)
            setSelectedBillItems(res.data)
            setShowModal(true)
        } catch (err) {
            console.error("Error fetching bill details:", err)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    // Filter Logic
    const filteredData = data.filter(item => {
        if (!searchTerm) return true
        const lowerSearch = searchTerm.toLowerCase()

        if (reportType === 'monthly') {
            return (item.MonthName && item.MonthName.toLowerCase().includes(lowerSearch)) ||
                (item.Year && item.Year.toString().includes(lowerSearch))
        }

        // For Transactions and Overdue
        return (item.CustomerName && item.CustomerName.toLowerCase().includes(lowerSearch)) ||
            (item.InvoiceNumber && item.InvoiceNumber.toLowerCase().includes(lowerSearch))
    })

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
        setCurrentPage(1)
    }

    const renderTableContent = () => {
        if (paginatedData.length === 0) {
            return <tr><td colSpan="6" className="text-center" style={{ padding: '30px' }}>No records found</td></tr>
        }

        if (reportType === 'monthly') {
            return paginatedData.map((item, idx) => (
                <tr key={idx}>
                    <td className="font-bold">{item.MonthName}</td>
                    <td>{item.Year}</td>
                    <td>{item.TotalOrders}</td>
                    <td className="text-right font-bold" style={{ color: 'var(--primary)' }}>₹{(item.TotalSales || 0).toFixed(2)}</td>
                </tr>
            ))
        }

        // Transactions & Overdue use similar structure
        return paginatedData.map(bill => (
            <tr key={bill.BillID}>
                <td>{formatDate(bill.ReturnDate)}</td>
                <td>{bill.CustomerName}</td>
                <td>
                    <button
                        className="link-btn"
                        onClick={() => fetchBillDetails(bill.BillID)}
                    >
                        {bill.InvoiceNumber}
                    </button>
                </td>
                <td>
                    <span className={`status-badge ${bill.PaymentStatus === 'Paid' ? 'paid' : 'pending'}`}>
                        {bill.PaymentStatus || 'Pending'}
                    </span>
                </td>
                <td className="text-right font-bold">₹{(bill.GrandTotal || 0).toFixed(2)}</td>
            </tr>
        ))
    }

    const renderTableHeader = () => {
        if (reportType === 'monthly') {
            return (
                <tr>
                    <th>Month</th>
                    <th>Year</th>
                    <th>Total Orders</th>
                    <th className="text-right">Total Sales</th>
                </tr>
            )
        }
        return (
            <tr>
                <th>Return Date</th>
                <th>Customer</th>
                <th>Invoice #</th>
                <th>Status</th>
                <th className="text-right">Total Amount</th>
            </tr>
        )
    }

    return (
        <section className="reports-container">
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content glass" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Invoice Details</h3>
                            <button onClick={() => setShowModal(false)} className="close-btn">&times;</button>
                        </div>
                        <div className="modal-body">
                            <table className="master-table">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Qty</th>
                                        <th>Price</th>
                                        <th className="text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedBillItems.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.ItemName}</td>
                                            <td>{item.Quantity}</td>
                                            <td>₹{(item.UnitPrice || 0).toFixed(2)}</td>
                                            <td className="text-right font-bold">₹{(item.TotalPrice || 0).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <header className="panel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <h2><i className="fa-solid fa-file-invoice"></i> Reports Center</h2>
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="search-input"
                            style={{ padding: '8px 15px 8px 35px', width: '250px' }}
                        />
                        <i className="fa-solid fa-magnifying-glass search-icon" style={{ fontSize: '0.8rem' }}></i>
                    </div>
                </div>

                <div className="report-tabs">
                    <button
                        className={`report-tab-btn ${reportType === 'transactions' ? 'active' : ''}`}
                        onClick={() => setReportType('transactions')}
                    >
                        <i className="fa-solid fa-list-check"></i> Transactions
                    </button>
                    <button
                        className={`report-tab-btn ${reportType === 'monthly' ? 'active' : ''}`}
                        onClick={() => setReportType('monthly')}
                    >
                        <i className="fa-solid fa-calendar-days"></i> Monthly Sales
                    </button>
                    <button
                        className={`report-tab-btn ${reportType === 'overdue' ? 'active' : ''}`}
                        onClick={() => setReportType('overdue')}
                        style={{ color: reportType === 'overdue' ? 'white' : 'var(--error)' }}
                    >
                        <i className="fa-solid fa-triangle-exclamation"></i> Overdue Bills
                    </button>
                </div>
            </header>

            <div className="report-content glass">
                {loading ? (
                    <div className="loading">Generating Report...</div>
                ) : (
                    <>
                        <div className="report-table-wrapper">
                            <table className="master-table">
                                <thead>
                                    {renderTableHeader()}
                                </thead>
                                <tbody>
                                    {renderTableContent()}
                                </tbody>
                            </table>
                        </div>

                        {filteredData.length > itemsPerPage && (
                            <div className="pagination-controls">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="page-btn"
                                >
                                    <i className="fa-solid fa-chevron-left"></i>
                                </button>
                                <span>Page {currentPage} of {totalPages}</span>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="page-btn"
                                >
                                    <i className="fa-solid fa-chevron-right"></i>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    )
}
