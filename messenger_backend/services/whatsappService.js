// services/whatsappService.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const MessageLog = require('../models/messageLog.js');

// Use the LocalAuth strategy to persist the session
const client = new Client({
    authStrategy: new LocalAuth(),
    // puppeteer options can be passed here
    puppeteer: {
        executablePath: '/usr/bin/google-chrome',
        headless: true, // Run in background
        args: ['--no-sandbox', '--disable-setuid-sandbox'], 
    },
});

let isClientReady = false;
// if (client) {
//     console.log('Client already exists, skipping init');
//     return;
// }
// Initialize the WhatsApp client
const initializeWhatsAppClient = (io) => { // Accept io instance
    console.log('Initializing WhatsApp client...');

    client.on('qr', (qr) => {
        console.log('QR code received, printing to terminal and emitting to frontend.');
        // qrcode.generate(qr, { small: true }); // i commented it out because show qr only to frontend
        io.emit('qr_code', qr); // Emit QR code to frontend
        io.emit('status_change', 'QR code received. Please scan.');
    });

    client.on('authenticated', () => {
        console.log('Authentication successful!');
        io.emit('status_change', 'Authentication successful!');
    });

    client.on('ready', () => {
        isClientReady = true;
        console.log('WhatsApp client is ready!');
        io.emit('client_ready'); // Notify frontend that client is ready
        io.emit('status_change', 'WhatsApp client is ready!');
    });

    client.on('auth_failure', (msg) => {
        console.error('Authentication failed:', msg);
        io.emit('status_change', `Authentication failed: ${msg}`);
        // You might want to exit the process or attempt to re-initialize
        process.exit(1);
    });

//     client.on('disconnected', (reason) => {
//         console.log('Client was logged out:', reason);
//         isClientReady = false;
//         io.emit('client_disconnected'); // Notify frontend of disconnection
//         io.emit('status_change', `Client was logged out: `);
//         // Destroy and re-initialize the client to get a new QR code
//         client.destroy();
//         initializeWhatsAppClient(io);
//     });
    client.on('disconnected', (reason) => {
    console.log('Client was logged out:', reason);

    isClientReady = false;
    io.emit('client_disconnected');
    io.emit('status_change', 'Client was logged out');

    // 🧘 Allow Puppeteer to finish cleanup
    setTimeout(async () => {
        try {
            await client.destroy();
            initializeWhatsAppClient(io); // safe after delay
        } catch (err) {
            console.error('Error resetting client:', err);
        }
    }, 2000); // IMPORTANT delay
});

    client.initialize().catch(err => {
        console.error('Failed to initialize WhatsApp client:', err);
    });
};
//     client.on('disconnected', (reason) => {
//     console.log('Client was logged out:', reason);

//     isClientReady = false;
//     io.emit('client_disconnected');
//     io.emit('status_change', 'Client was logged out');

//     // 🧘 Allow Puppeteer to finish cleanup
//     setTimeout(async () => {
//         try {
//             await client.destroy();
//             initializeWhatsAppClient(io); // safe after delay
//         } catch (err) {
//             console.error('Error resetting client:', err);
//         }
//     }, 2000); // IMPORTANT delay
// });


///==========================================added this 

//==============================addded this 
/**
 * Logs a message sending attempt to the database.
 * @param {string} number - The contact number.
 * @param {string} message - The message content.
 * @param {'success' | 'failed'} status - The status of the message.
 */
const logMessage = async (number, message, status) => {
    await MessageLog.create({ contactNumber: number, message, status });
};

/**
 * Sends a message to a list of phone numbers with a delay between each message.
 * @param {string[]} numbers - Array of phone numbers.
 * @param {string} message - The message to send.
 * @returns {Promise<{success: Array, failed: Array}>} - A summary of sent and failed messages.
 */
// const sendBulkMessages = async (numbers, message) => {
//     if (!isClientReady) {
//         throw new Error('WhatsApp client is not ready.');
//     }

//     const results = {
//         success: [],
//         failed: [],
//     };

//     for (const number of numbers) {
//         // WhatsApp Web JS expects numbers in the format 'countrycode_number@c.us'
//         const chatId = `${number}@c.us`;
//         try {
//             // Check if the number is registered on WhatsApp
//             const isRegistered = await client.isRegisteredUser(chatId);
//             if (!isRegistered) {
//                 console.warn(`Number ${number} is not registered on WhatsApp. Skipping.`);
//                 results.failed.push({ number, reason: 'Not registered on WhatsApp' });
//                 await logMessage(number, message, 'failed');
//                 continue;
//             }

//             await client.sendMessage(chatId, message);
//             console.log(`Message sent to ${number}`);
//             results.success.push(number);
//             await logMessage(number, message, 'success');

//             // Add a random delay between 1 to 5 seconds to avoid being flagged as spam
//             const delay = Math.floor(Math.random() * 4000) + 1000;
//             await new Promise(resolve => setTimeout(resolve, delay));

//         } catch (error) {
//             console.error(`Failed to send message to ${number}:`, error.message);
//             results.failed.push({ number, reason: error.message });
//             await logMessage(number, message, 'failed');
//         }
//     }

//     return results;
// };

                     
async function sendBulkMessages(numbers, message) {
  const success = [];
  const failed = [];
    const fromNumber = client.info?.wid?.user;   
  for (const number of numbers) {
    try {
      // send message logic
      await client.sendMessage(`${number}@c.us`, message);

      success.push(number);

      await MessageLog.create({
        fromNumber,
        contactNumber: number,
        message,
        status: 'success'
      });

    } catch (err) {
      failed.push(number);

      await MessageLog.create({
        contactNumber: number,
        message,
        status: 'failed'
      });
    }
  }

  return { success, failed };
}


// module.exports = {
//     initializeWhatsAppClient,
//     sendBulkMessages,
//     isClientReady: () => isClientReady,
//     client
// };

module.exports = {
    initializeWhatsAppClient,
    sendBulkMessages,
    isClientReady: () => isClientReady,
    client
};
