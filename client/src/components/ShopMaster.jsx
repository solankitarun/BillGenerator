import React, { useState, useEffect } from 'react'
import api from '../api'
import '../App.css'

export default function ShopMaster({ onUpdate, setAlert }) {
    const [shop, setShop] = useState({
        ShopName: '',
        Tagline: '',
        Address: '',
        Phone: '',
        TaxRate: 0.05
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchShop()
    }, [])

    const fetchShop = async () => {
        try {
            const res = await api.get('/shop')
            setShop(res.data)
            setLoading(false)
        } catch (err) {
            console.error('Error fetching shop:', err)
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await api.post('/shop', shop)
            if (onUpdate) onUpdate()
            setAlert({ show: true, message: 'Shop details updated successfully!' })
        } catch (err) {
            console.error('Error saving shop:', err)
            setAlert({ show: true, message: 'Failed to save shop details. Please check your connection.' })
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="loading">Loading Shop Details...</div>

    return (
        <section className="panel glass master-panel">
            <header className="panel-header">
                <h2><i className="fa-solid fa-store"></i> Shop Master</h2>
                <p>Manage your shop branding and legal configuration</p>
            </header>

            <form className="master-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Shop Name</label>
                        <input
                            type="text"
                            value={shop.ShopName}
                            onChange={e => setShop({ ...shop, ShopName: e.target.value })}
                            placeholder="e.g. FreshWash Laundry"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Tagline</label>
                        <input
                            type="text"
                            value={shop.Tagline}
                            onChange={e => setShop({ ...shop, Tagline: e.target.value })}
                            placeholder="e.g. Premium Laundry Services"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Full Address</label>
                    <textarea
                        className="address-textarea"
                        value={shop.Address}
                        onChange={e => setShop({ ...shop, Address: e.target.value })}
                        placeholder="Shop street, city, pincode"
                        rows="2"
                    />
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label>Contact Number</label>
                        <input
                            type="text"
                            value={shop.Phone}
                            onChange={e => setShop({ ...shop, Phone: e.target.value })}
                            placeholder="Primary contact"
                        />
                    </div>
                    <div className="form-group">
                        <label>Tax Rate (Decimal)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={shop.TaxRate}
                            onChange={e => setShop({ ...shop, TaxRate: parseFloat(e.target.value) })}
                            placeholder="e.g. 0.05 for 5%"
                            required
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-success" disabled={saving}>
                        {saving ? 'Saving...' : 'Update Details'}
                    </button>
                </div>
            </form>
        </section>
    )
}
