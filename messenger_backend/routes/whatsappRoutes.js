// routes/whatsappRoutes.js
const express = require('express');
const multer = require('multer');
const { celebrate, Joi, Segments } = require('celebrate');
const { sendMessagesFromExcel, downloadReport } = require('../controllers/whatsappController.js');

const router = express.Router();

// Configure multer for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Accept only Excel files
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only Excel files are allowed.'), false);
        }
    },
});

// Validation schema using Joi via celebrate
const sendMessageSchema = {
    [Segments.BODY]: Joi.object().keys({
        message: Joi.string().required().min(1),
    }),
};

// Define the route for sending messages
router.post(
    '/send-messages',
    upload.single('excelFile'), // Middleware to handle single file upload with field name 'excelFile'
    celebrate(sendMessageSchema),
    sendMessagesFromExcel
);

// Define the route for downloading the report
router.get('/download-report', downloadReport);

module.exports = router;
