import React, { useState, useEffect } from 'react'
import api from '../api'
import '../App.css'

export default function Dashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/reports/dashboard')
                setStats(res.data)
                setLoading(false)
            } catch (err) {
                console.error("Error fetching dashboard stats:", err)
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) return <div className="loading">Loading Dashboard...</div>

    return (
        <section className="dashboard-container">
            <header className="panel-header">
                <h2><i className="fa-solid fa-chart-line"></i> Dashboard</h2>
                <p>Real-time performance metrics and insights</p>
            </header>

            <div className="stats-grid">
                <div className="stat-card glass">
                    <div className="stat-icon revenue"><i className="fa-solid fa-indian-rupee-sign"></i></div>
                    <div className="stat-info">
                        <h3>Today's Revenue</h3>
                        <p className="stat-value">₹{(stats?.today?.Revenue || 0).toFixed(2)}</p>
                    </div>
                </div>

                <div className="stat-card glass">
                    <div className="stat-icon orders"><i className="fa-solid fa-receipt"></i></div>
                    <div className="stat-info">
                        <h3>Today's Orders</h3>
                        <p className="stat-value">{stats?.today?.Orders || 0}</p>
                    </div>
                </div>

                <div className="stat-card glass">
                    <div className="stat-icon pending"><i className="fa-solid fa-clock-rotate-left"></i></div>
                    <div className="stat-info">
                        <h3>Pending Collections</h3>
                        <p className="stat-value">{stats?.pendingDeliveries || 0}</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-sections">
                <div className="top-items-panel glass">
                    <h3><i className="fa-solid fa-star"></i> Most Popular Services</h3>
                    <div className="item-list">
                        {stats?.topItems && stats.topItems.length > 0 ? (
                            stats.topItems.map((item, index) => (
                                <div key={index} className="top-item-row">
                                    <span className="item-name">{item.ItemName}</span>
                                    <div className="item-bar-container">
                                        <div
                                            className="item-bar"
                                            style={{ width: `${(item.TotalQty / stats.topItems[0].TotalQty) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="item-qty">{item.TotalQty}</span>
                                </div>
                            ))
                        ) : (
                            <p className="no-data">No data available for top services</p>
                        )}
                    </div>
                </div>

                <div className="quick-actions-panel glass">
                    <h3><i className="fa-solid fa-bolt"></i> Quick Insights</h3>
                    <div className="insight-card">
                        <p>Average Order Value</p>
                        <span className="insight-value">
                            ₹{stats?.today?.Orders > 0
                                ? (stats.today.Revenue / stats.today.Orders).toFixed(2)
                                : '0.00'}
                        </span>
                    </div>
                    <div className="insight-card">
                        <p>Busiest Service</p>
                        <span className="insight-value">{stats?.topItems?.[0]?.ItemName || 'N/A'}</span>
                    </div>
                </div>
            </div>
        </section>
    )
}
