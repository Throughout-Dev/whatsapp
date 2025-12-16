// controllers/whatsappController.js
// const { getNumbersFromExcel } = require('../services/excelService.js');
const { getNumbersFromExcel } = require('../services/excelService');
const { sendBulkMessages, isClientReady } = require('../services/whatsappService.js');
const MessageLog = require('../models/messageLog.js');
const exceljs = require('exceljs');

const sendMessagesFromExcel = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No Excel file uploaded.' });
        }

        if (!isClientReady()) {
            return res.status(503).json({ error: 'WhatsApp client is not ready. Please scan the QR code and try again.' });
        }

        const { message } = req.body;
        const numbers = await getNumbersFromExcel(req.file.buffer);

        if (numbers.length === 0) {
            return res.status(400).json({ error: 'No valid phone numbers found in the Excel file.' });
        }

        console.log(`Sending message to ${numbers.length} valid numbers.`);
        const results = await sendBulkMessages(numbers, message);

        res.status(200).json({
            message: 'Message sending process completed.',
            summary: {
                totalNumbers: numbers.length,
                sentCount: results.success.length,
                failedCount: results.failed.length,
                successfulNumbers: results.success,
                failedNumbers: results.failed,
            },
        });
    } catch (error) {
        console.error('Error in sendMessagesFromExcel controller:', error);
        next(error); // Pass error to the global error handler
    }
};

const downloadReport = async (req, res, next) => {
    try {
        const logs = await MessageLog.find().sort({ createdAt: -1 });

        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet('Sent Messages Report');

        // Define columns
        worksheet.columns = [
            { header: 'Contact Number', key: 'contactNumber', width: 20 },
            { header: 'Message', key: 'message', width: 50 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Date', key: 'createdAt', width: 25 },
        ];

        // Add rows
        logs.forEach(log => {
            worksheet.addRow({
                contactNumber: log.contactNumber,
                message: log.message,
                status: log.status,
                createdAt: log.createdAt.toLocaleString(),
            });
        });

        // Set response headers to trigger download
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + 'sent_messages_report.xlsx'
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error in downloadReport controller:', error);
        next(error);
    }
};

const viewReport = async (req, res) => {
    console.log("===========================================")
  try {
    console.log('Inside middleware')
    const reports = await MessageLog.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error("View report error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch report"
    });
  }
};

module.exports = { sendMessagesFromExcel, downloadReport, viewReport };


