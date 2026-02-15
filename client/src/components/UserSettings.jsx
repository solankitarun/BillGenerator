import React, { useState } from 'react'
import api from '../api'

export default function UserSettings({ username, setAlert }) {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [saving, setSaving] = useState(false)

    const handleChangePassword = async (e) => {
        e.preventDefault()

        if (newPassword !== confirmPassword) {
            return setAlert({ show: true, message: 'New passwords do not match' })
        }

        setSaving(true)
        try {
            await api.post('/change-password', {
                username,
                currentPassword,
                newPassword
            })
            setAlert({ show: true, message: 'Password changed successfully!' })
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (err) {
            console.error(err)
            setAlert({ show: true, message: err.response?.data?.message || 'Failed to change password' })
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="settings-container">
            <header className="settings-header">
                <div className="header-content">
                    <h1><i className="fa-solid fa-sliders"></i> Account Settings</h1>
                    <p>Manage your profile information and security preferences</p>
                </div>
            </header>

            <div className="settings-grid">
                {/* Profile Section */}
                <section className="settings-card glass">
                    <div className="card-header">
                        <i className="fa-solid fa-circle-user card-icon"></i>
                        <div className="card-title">
                            <h3>Profile Details</h3>
                            <p>Basic account information</p>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="info-label">Current Username</span>
                            <span className="info-value">{username}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Account Role</span>
                            <span className="info-value badge-primary">Administrator</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Status</span>
                            <span className="info-value status-active">
                                <i className="fa-solid fa-circle-check"></i> Active
                            </span>
                        </div>
                    </div>
                </section>

                {/* Security Section */}
                <section className="settings-card glass">
                    <div className="card-header">
                        <i className="fa-solid fa-shield-halved card-icon"></i>
                        <div className="card-title">
                            <h3>Security & Privacy</h3>
                            <p>Update your access credentials</p>
                        </div>
                    </div>
                    <div className="card-body">
                        <form className="settings-form" onSubmit={handleChangePassword}>
                            <div className="form-group">
                                <label><i className="fa-solid fa-lock"></i> Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    placeholder="Verify current password"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label><i className="fa-solid fa-key"></i> New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder="Min. 6 characters"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div className="form-group">
                                    <label><i className="fa-solid fa-check-double"></i> Confirm New</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat new password"
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary full-width" disabled={saving}>
                                {saving ? (
                                    <><i className="fa-solid fa-spinner fa-spin"></i> Updating...</>
                                ) : (
                                    <><i className="fa-solid fa-shield-heart"></i> Save Changes</>
                                )}
                            </button>
                        </form>
                    </div>
                </section>
            </div>

            <footer className="settings-footer">
                <p><i className="fa-solid fa-circle-info"></i> Security Tip: Use a strong password with a mix of letters, numbers, and symbols.</p>
            </footer>
        </div>
    )
}
