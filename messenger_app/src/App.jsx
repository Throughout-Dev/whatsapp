import { useState, useEffect } from 'react'
import io from 'socket.io-client';
import QRCode from 'react-qr-code';
import axios from 'axios';
import './App.css'

const SOCKET_URL = "http://localhost:3000"; // Your backend URL
const socket = io(SOCKET_URL);

function App() {
  const [statusMessage, setStatusMessage] = useState('Connecting to server...');
  const [qrCode, setQrCode] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    socket.on('connect', () => {
      setStatusMessage('Connected to server. Waiting for WhatsApp client...');
    });

    socket.on('qr_code', (qr) => {
      setStatusMessage('QR code received. Please scan with your phone.');
      setQrCode(qr);
      setIsReady(false);
    });

    socket.on('client_ready', () => {
      setStatusMessage('WhatsApp client is ready!');
      setQrCode('');
      setIsReady(true);
    });

    socket.on('status_change', (newStatus) => {
      setStatusMessage(newStatus);
    });

    socket.on('client_disconnected', () => {
      setStatusMessage('WhatsApp client disconnected. Please wait for a new QR code.');
      setIsReady(false);
      setQrCode('');
    });

    return () => {
      socket.off('connect');
      socket.off('qr_code');
      socket.off('client_ready');
      socket.off('status_change');
      socket.off('client_disconnected');
    };
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !message) {
      alert('Please select an Excel file and enter a message.');
      return;
    }

    const formData = new FormData();
    formData.append('excelFile', file);
    formData.append('message', message);

    setIsSubmitting(true);
    setSummary(null);

    try {
      const response = await axios.post(`${SOCKET_URL}/api/whatsapp/send-messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error sending messages:', error);
      alert(`Failed to send messages: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadReport = () => {
    window.open(`${SOCKET_URL}/api/whatsapp/download-report`, '_blank');
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>WhatsApp Bulk Messenger</h1>
        <p className="status">Status: {statusMessage}</p>                     
      </header>

      {!isReady && qrCode && (
        <div className="qr-container card">
          <h2>Scan QR Code</h2>
          <QRCode value={qrCode} />
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="file-upload">Upload Excel File (with numbers)</label>
            <input id="file-upload" type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
          </div>
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows="4" />
          </div>
          <button type="submit" disabled={!isReady || isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Messages'}
          </button>
        </form>
      </div>

      {summary && (
        <div className="summary-container card">
          <h2>Sending Summary</h2>
          <p>Total Numbers: {summary.totalNumbers}</p>
          <p className="success">Sent Successfully: {summary.sentCount}</p>
          <p className="failure">Failed to Send: {summary.failedCount}</p>
        </div>
      )}

      <div className="card">
        <h2>Download Report</h2>
        <p>Download a report of all message sending attempts.</p>
        <button onClick={handleDownloadReport}>Download Report</button>
      </div>
    </div>
  );
}

export default App
