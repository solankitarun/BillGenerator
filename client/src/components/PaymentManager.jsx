import React, { useState, useEffect } from 'react'
import api from '../api'
import '../App.css'

export default function PaymentManager({ setAlert }) {
    const [pendingBills, setPendingBills] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(true)

    const itemsPerPage = 5

    useEffect(() => {
        fetchPendingBills()
    }, [])

    const fetchPendingBills = async () => {
        try {
            const res = await api.get('/bills/pending')
            setPendingBills(res.data)
            setLoading(false)
        } catch (err) {
            console.error('Error fetching pending bills:', err)
            setLoading(false)
        }
    }

    const handleMarkPaid = (billId, invoiceNum) => {
        setAlert({
            show: true,
            message: `Confirm payment for Invoice ${invoiceNum}?`,
            isConfirm: true,
            onConfirm: async () => {
                try {
                    await api.put(`/bills/${billId}/pay`)
                    setAlert({ show: true, message: 'Payment confirmed successfully!' })
                    fetchPendingBills()
                } catch (err) {
                    console.error('Error updating payment:', err)
                    setAlert({ show: true, message: 'Failed to update payment status.' })
                }
            }
        })
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
    const filteredBills = pendingBills.filter(bill =>
        bill.CustomerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.InvoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Pagination Logic
    const totalPages = Math.ceil(filteredBills.length / itemsPerPage)
    const paginatedBills = filteredBills.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
        setCurrentPage(1) // Reset to page 1 on search
    }

    return (
        <section className="master-container" style={{ maxWidth: '1000px' }}>
            <header className="panel-header">
                <h2><i className="fa-solid fa-cash-register"></i> Pending Payments</h2>
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search Invoice or Customer..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                    />
                    <i className="fa-solid fa-magnifying-glass search-icon"></i>
                </div>
            </header>

            <div className="glass" style={{ padding: '0' }}>
                {loading ? (
                    <div className="loading">Loading Pending Bills...</div>
                ) : (
                    <>
                        <div className="table-responsive">
                            <table className="master-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Invoice #</th>
                                        <th>Customer</th>
                                        <th>Phone</th>
                                        <th className="text-right">Amount</th>
                                        <th className="text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedBills.length > 0 ? (
                                        paginatedBills.map(bill => (
                                            <tr key={bill.BillID}>
                                                <td>{formatDate(bill.BillDate)}</td>
                                                <td className="font-bold">{bill.InvoiceNumber}</td>
                                                <td>{bill.CustomerName}</td>
                                                <td>{bill.CustomerPhone}</td>
                                                <td className="text-right font-bold">₹{bill.GrandTotal.toFixed(2)}</td>
                                                <td className="text-center">
                                                    <button
                                                        className="btn-primary"
                                                        style={{ padding: '5px 15px', fontSize: '0.85rem' }}
                                                        onClick={() => handleMarkPaid(bill.BillID, bill.InvoiceNumber)}
                                                    >
                                                        <i className="fa-solid fa-check"></i> Mark Paid
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center" style={{ padding: '40px' }}>
                                                {searchTerm ? (
                                                    <p>No matching bills found.</p>
                                                ) : (
                                                    <>
                                                        <i className="fa-solid fa-check-circle" style={{ fontSize: '2rem', color: 'var(--success)', marginBottom: '10px' }}></i>
                                                        <p>All clear! No pending payments.</p>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {filteredBills.length > itemsPerPage && (
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
