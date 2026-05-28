import React from 'react'
import '../App.css'

export default function CustomAlert({ message, isOpen, onClose, isConfirm, onConfirm, onCancel }) {
    if (!isOpen) return null;

    return (
        <div className="alert-overlay">
            <div className="alert-box glass">
                <div className="alert-icon">
                    <i className={`fa-solid ${isConfirm ? 'fa-question-circle' : 'fa-circle-exclamation'}`}></i>
                </div>
                <h3>{isConfirm ? 'Confirm' : 'Attention'}</h3>
                <p>{message}</p>
                <div className="alert-actions">
                    {isConfirm ? (
                        <>
                            <button className="btn-secondary alert-btn" onClick={() => { onCancel && onCancel(); onClose(); }}>
                                Cancel
                            </button>
                            <button className="btn-primary alert-btn" onClick={() => { onConfirm && onConfirm(); onClose(); }}>
                                Yes, Proceed
                            </button>
                        </>
                    ) : (
                        <button className="btn-primary alert-btn" onClick={onClose}>
                            Okey-dokey
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
