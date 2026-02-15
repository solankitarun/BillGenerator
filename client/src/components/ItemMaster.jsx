import React, { useState, useEffect } from 'react'
import api from '../api'
import '../App.css'

export default function ItemMaster({ onRefreshItems, setAlert }) {
    const [items, setItems] = useState([])
    const [newItem, setNewItem] = useState({ ItemName: '', UnitPrice: '' })
    const [editingId, setEditingId] = useState(null)
    const [editItem, setEditItem] = useState({ ItemName: '', UnitPrice: '' })
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        try {
            const res = await api.get('/items')
            setItems(res.data)
            setLoading(false)
        } catch (err) {
            console.error('Error fetching items:', err)
            setLoading(false)
        }
    }

    const handleAdd = async (e) => {
        e.preventDefault()
        try {
            await api.post('/items', newItem)
            setNewItem({ ItemName: '', UnitPrice: '' })
            fetchItems()
            if (onRefreshItems) onRefreshItems()
            setAlert({ show: true, message: 'New cloth type added successfully!' })
        } catch (err) {
            console.error('Error adding item:', err)
            setAlert({ show: true, message: 'Failed to add item. Please try again.' })
        }
    }

    const handleUpdate = async (id) => {
        try {
            await api.put(`/items/${id}`, editItem)
            setEditingId(null)
            fetchItems()
            if (onRefreshItems) onRefreshItems()
            setAlert({ show: true, message: 'Item updated successfully!' })
        } catch (err) {
            console.error('Error updating item:', err)
            setAlert({ show: true, message: 'Failed to update item.' })
        }
    }

    const handleDelete = (id) => {
        setAlert({
            show: true,
            message: 'Are you sure you want to delete this cloth type?',
            isConfirm: true,
            onConfirm: async () => {
                try {
                    await api.delete(`/items/${id}`)
                    fetchItems()
                    if (onRefreshItems) onRefreshItems()
                } catch (err) {
                    console.error('Error deleting item:', err)
                    setAlert({ show: true, message: 'Failed to delete item.' })
                }
            }
        })
    }

    const startEdit = (item) => {
        setEditingId(item.ItemID)
        setEditItem({ ItemName: item.ItemName, UnitPrice: item.UnitPrice })
    }

    const totalPages = Math.ceil(items.length / itemsPerPage)
    const paginatedItems = items.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    return (
        <section className="panel glass master-panel">
            <header className="panel-header">
                <h2><i className="fa-solid fa-shirt"></i> ClothType Master</h2>
                <p>Add and manage laundry services and their pricing</p>
            </header>

            <div className="master-content">
                {/* Add New Form */}
                <form className="item-add-form" onSubmit={handleAdd}>
                    <input
                        type="text"
                        placeholder="Cloth Name (e.g. Shirt)"
                        value={newItem.ItemName}
                        onChange={e => setNewItem({ ...newItem, ItemName: e.target.value })}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        value={newItem.UnitPrice}
                        onChange={e => setNewItem({ ...newItem, UnitPrice: e.target.value })}
                        required
                    />
                    <button type="submit" className="btn-success">Add Item</button>
                </form>

                {/* Items List */}
                <div className="master-table-container" style={{ maxHeight: 'none', overflowY: 'visible' }}>
                    <table className="master-table">
                        <thead>
                            <tr>
                                <th>Cloth Type</th>
                                <th>Price</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedItems.map(item => (
                                <tr key={item.ItemID}>
                                    <td>
                                        {editingId === item.ItemID ? (
                                            <input
                                                className="table-input"
                                                value={editItem.ItemName}
                                                onChange={e => setEditItem({ ...editItem, ItemName: e.target.value })}
                                            />
                                        ) : (
                                            item.ItemName
                                        )}
                                    </td>
                                    <td>
                                        {editingId === item.ItemID ? (
                                            <input
                                                type="number"
                                                className="table-input"
                                                value={editItem.UnitPrice}
                                                onChange={e => setEditItem({ ...editItem, UnitPrice: e.target.value })}
                                            />
                                        ) : (
                                            `₹${(item.UnitPrice || 0).toFixed(2)}`
                                        )}
                                    </td>
                                    <td className="text-right">
                                        {editingId === item.ItemID ? (
                                            <>
                                                <button className="icon-btn btn-save" onClick={() => handleUpdate(item.ItemID)}>
                                                    <i className="fa-solid fa-check"></i>
                                                </button>
                                                <button className="icon-btn btn-cancel" onClick={() => setEditingId(null)}>
                                                    <i className="fa-solid fa-xmark"></i>
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="icon-btn btn-edit" onClick={() => startEdit(item)}>
                                                    <i className="fa-solid fa-pen"></i>
                                                </button>
                                                <button className="icon-btn btn-delete" onClick={() => handleDelete(item.ItemID)}>
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {items.length > itemsPerPage && (
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
            </div>
        </section>
    )
}
