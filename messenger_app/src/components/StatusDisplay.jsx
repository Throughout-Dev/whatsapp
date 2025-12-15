import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const StatusDisplay = ({ isConnected, qrCode, statusMessage }) => {
    return (
        <div className="card shadow-sm text-center h-100">
            <div className="card-header bg-white fw-bold">
                Connection Status
            </div>
            <div className="card-body d-flex flex-column align-items-center justify-content-center">
                {isConnected ? (
                    <div className="text-success">
                        <h5 className="card-title">Client Connected</h5>
                        <p className="card-text">Ready to send messages.</p>
                    </div>
                ) : qrCode ? (
                    <div>
                        <h5 className="card-title">Scan QR Code</h5>
                        <div className="p-3 border rounded bg-white d-inline-block">
                           <QRCodeSVG value={qrCode} size={180} />
                        </div>
                    </div>
                ) : (
                    <div>
                        <h5 className="card-title">Connecting...</h5>
                        <div className="spinner-border text-success" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}
                 <p className="text-muted mt-3 mb-0"><small>{statusMessage}</small></p>
            </div>
        </div>
    );
};

export default StatusDisplay;
