import React from 'react';

const StatusAlert = ({ info }) => {
    if (!info || !info.message) return null;
    return (
        <div className={`alert alert-${info.type || 'info'} mt-3 alert-dismissible fade show`} role="alert">
            {info.message}
            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    );
};

export default StatusAlert;
