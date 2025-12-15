import React from 'react';

const MessageForm = ({ onFileChange, onMessageChange, onSubmit, loading, isConnected }) => (
    <div className="card shadow-sm">
        <div className="card-body">
            <h5 className="card-title mb-3">Send New Message</h5>
            <fieldset disabled={!isConnected || loading}>
                <form onSubmit={onSubmit} id="message-form">
                    <div className="mb-3">
                        <label htmlFor="excelFile" className="form-label">1. Upload Contacts (Excel)</label>
                        <input type="file" className="form-control" id="excelFile" accept=".xlsx, .xls" onChange={onFileChange} required/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="message" className="form-label">2. Compose Message</label>
                        <textarea className="form-control" id="message" rows="4" placeholder="Type your message here..." onChange={onMessageChange} required></textarea>
                    </div>
                    <button type="submit" className="btn btn-success w-100">
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                                Sending...
                            </>
                        ) : 'Send Messages'}
                    </button>
                </form>
            </fieldset>
        </div>
    </div>
);

export default MessageForm;
