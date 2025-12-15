import React from 'react';

const ReportDownloader = ({ onDownload, loading }) => (
    <div className="card shadow-sm mt-4">
        <div className="card-body">
            <h5 className="card-title mb-3">Download Report</h5>
            <p className="card-text">Download a log of all sent and failed messages.</p>
            <button className="btn btn-outline-primary w-100" onClick={onDownload} disabled={loading}>
                {loading ? 'Downloading...' : 'Download Sent Report'}
            </button>
        </div>
    </div>
);

export default ReportDownloader;
