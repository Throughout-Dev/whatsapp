// services/excelService.js
const exceljs = require('exceljs');

/**
 * Parses an Excel file buffer to extract valid phone numbers from the first column.
 * @param {Buffer} buffer - The buffer of the uploaded Excel file.
 * @returns {Promise<string[]>} - A promise that resolves to an array of valid phone numbers.
 */
const getNumbersFromExcel = async (buffer) => {
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.worksheets[0]; // Get the first worksheet
    const validNumbers = [];
    const invalidEntries = [];
    let invalidCountryCodeCount = 0;
    const seenNumbers = new Set();
    let duplicateCount = 0;

    // Regex to validate phone numbers starting with country code '91' followed by 10 digits.
    const indianPhoneRegex = /^91\d{10}$/;

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        // Assuming phone numbers are in the first column (A)
        const cellValue = row.getCell(1).value;
        if (cellValue) {
            const phoneNumber = String(cellValue).replace(/\s+/g, ''); // Remove spaces

            // A generic check to see if it looks like a number before testing the country code.
            if (!/^\d+$/.test(phoneNumber)) {
                invalidEntries.push({ value: cellValue, row: rowNumber });
                return; // Skip to the next row
            }

            if (indianPhoneRegex.test(phoneNumber)) {
                if (seenNumbers.has(phoneNumber)) {
                    duplicateCount++;
                } else {
                    seenNumbers.add(phoneNumber);
                    validNumbers.push(phoneNumber);
                }
            } else {
                // The number format is valid digits but does not match the country code rule.
                invalidCountryCodeCount++;
            }
        }
    });

    if (invalidEntries.length > 0) {
        console.warn('Skipped invalid entries:', invalidEntries);
    }

    if (duplicateCount > 0) {
        console.log(`Found ${duplicateCount} numbers are duplicate.`);
    }

    if (invalidCountryCodeCount > 0) {
        console.log(`skipped ${invalidCountryCodeCount} numbers becasue of invalid country code`);
    }

    return validNumbers;
};

module.exports = { getNumbersFromExcel };
