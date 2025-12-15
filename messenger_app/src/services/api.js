import axios from 'axios';

// Your backend is running on port 3000
const apiClient = axios.create({
    baseURL: 'http://localhost:3000/api/whatsapp',
});

/**
 * Sends the message and Excel file to the backend.
 */
export const sendMessages = (file, message) => {
    const formData = new FormData();
    formData.append('excelFile', file);
    formData.append('message', message);
    return apiClient.post('/send-messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

/**
 * Downloads the message log report from the backend.
 */
export const downloadReport = async () => {
    const response = await apiClient.get('/download-report', { responseType: 'blob' });
    
    // Create a temporary link to trigger the download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sent_messages_report.xlsx');
    document.body.appendChild(link);
    link.click();
    
    // Clean up the temporary link
    link.remove();
    window.URL.revokeObjectURL(url);
};
