import React, { useState } from 'react';

const RevocationRequestModal = ({ open, onClose, onSubmit, leave }) => {
    const [reason, setReason] = useState('');

    if (!open || !leave) return null;

    const handleSubmit = () => {
        onSubmit(leave._id, reason);
        setReason('');
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
        }}>
            <div style={{
                background: '#fff',
                padding: 24,
                borderRadius: 8,
                width: 400,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
                <h3 style={{ marginTop: 0 }}>Request Revocation</h3>
                <p>This leave is in the past. To revoke it, you must submit a request to your manager.</p>
                <p><strong>Date:</strong> {new Date(leave.date).toLocaleDateString()}</p>

                <textarea
                    placeholder="Reason for revocation..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    style={{ width: '100%', height: 100, marginBottom: 16, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <button onClick={onClose} style={{ padding: '8px 16px', background: '#ccc', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handleSubmit} disabled={!reason.trim()} style={{ padding: '8px 16px', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Submit Request</button>
                </div>
            </div>
        </div>
    );
};

export default RevocationRequestModal;
