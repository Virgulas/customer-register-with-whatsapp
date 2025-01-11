const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const qrcode = require('qrcode');
const cors = require('cors');
const RegistrationHandler = require('./functions/register/handleRegister');
const DateHelper = require('./functions/date/dateHelper')
const settings = require('./settings.json');
const authorizedNumber = settings.authorizedNumber;
const { getUsersByPage, getUserCount, User, getUser, createUser, deleteUser } = require('./functions/user/functions');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

let client;

// Function to initialize WhatsApp client with retries
async function initializeClient(retryCount = 3) {
    if (client) {
        client.destroy();
    }

    client = new Client({
        authStrategy: new LocalAuth()
    });

    client.on('qr', async qr => {
        try {
            const qrCodeDataURL = await qrcode.toDataURL(qr);
            io.emit('qr', qrCodeDataURL); // Emit QR code to frontend
        } catch (error) {
            console.error('Error generating QR code:', error);
        }
    });

    client.on('ready', () => {
        console.log('Client is ready!');
        io.emit('ready');
    });

    client.on('disconnected', async (reason) => {
        console.error('WhatsApp client disconnected:', reason);
        await handleReconnect();
    });

    client.on('auth_failure', async (message) => {
        console.error('Authentication failure:', message);
        await handleReconnect();
    });

    client.on('message_create', async (message) => {
        // Your existing message handling logic
        try {
            const userId = message.from;
            const userMessage = message.body.trim().toLowerCase();

            if (userMessage === settings.register && userId === authorizedNumber) {
                const targetUserId = message.to;
                if (!RegistrationHandler.getCurrentCustomer(targetUserId)) {
                    RegistrationHandler.setCurrentCustomer(targetUserId, { step: settings.registerSteps.REGISTER_PROMPT });
                    client.sendMessage(targetUserId, settings.registerMessages.REGISTER_PROMPT);
                }
            } else if (userMessage === settings.restart && userId !== authorizedNumber) {
                if (RegistrationHandler.getCurrentCustomer(userId)) {
                    RegistrationHandler.removeCustomer(userId);
                }
                RegistrationHandler.setCurrentCustomer(userId, { step: settings.registerSteps.REGISTER_PROMPT });
                await RegistrationHandler.handleRegistration(userId, "sim", client);
            } else if (RegistrationHandler.getCurrentCustomer(userId)) {
                if (userId === authorizedNumber) return;
                await RegistrationHandler.handleRegistration(userId, userMessage, client);
            }
        } catch (error) {
            console.error('Error handling message_create event:', error);
            client.sendMessage(message.from, 'An error occurred while processing your request. Please try again later.');
        }
    });

    try {
        await client.initialize();
    } catch (error) {
        console.error(`Initialization error: ${error.message}`);
        if (retryCount > 0) {
            console.log(`Retrying initialization (${retryCount} attempts left)...`);
            await initializeClient(retryCount - 1);
        } else {
            console.error('Failed to initialize WhatsApp client after retries.');
        }
    }
}

// Reconnection handler function
async function handleReconnect() {
    console.log('Attempting to reconnect...');
    await initializeClient();
}

// Initialize the client for the first time
initializeClient();

app.get('/status', (req, res) => {
    res.json({ status: client.info ? 'connected' : 'disconnected', connection: true });
});

app.post('/send-message', async (req, res) => {
    const { number, message } = req.body;
    try {
        await client.sendMessage(number, message);
        res.status(200).json({ success: true, message: 'Message sent!' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

app.get('/get-users', async (req, res) => {
    const page = parseInt(req.query.page) || 1;  
    const users = await getUsersByPage(page, 10);
    res.json({ users: users });
});

app.post('/create-user', async (req, res) => {
    const { id, name, birthday, period } = req.body;

    // Validate birthday
    const validatedBirthday = DateHelper.validate(birthday);
    if (!validatedBirthday) {
        return res.status(400).json({ error: 'Invalid birthday format. Use DD/MM.' });
    }

    // Calculate callDate as today's date + period
    const callDate = DateHelper.sum(DateHelper.getCurrent(), parseInt(period, 10));

    try {
        const result = await createUser(id, name, validatedBirthday, parseInt(period, 10), callDate);

        if (result.created) {
            return res.status(201).json({ message: 'User created successfully', user: result.user });
        } else if (result.updated) {
            return res.status(200).json({ message: 'User updated successfully' });
        }
    } catch (error) {
        console.error('Error creating or updating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/user-count', async (req, res) => {
    try {
      const userCount = await getUserCount();
      res.json({ count: userCount });
    } catch (error) {
      console.error('Error fetching user count:', error);
      res.status(500).json({ error: 'Failed to fetch user count' });
    }
  });

  // In your server code (e.g., `index.js`)

app.get('/get-user', async (req, res) => {
    const { id, name } = req.query;

    let user;
    if (id) {
        user = await getUser(id);
    } else if (name) {
        user = await User.findOne({ where: { name } });
    }

    if (user) {
        res.json({ user });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// Server-side route to get users with birthdays today
app.get('/users-birthday-today', async (req, res) => {
    try {
        const today = DateHelper.getCurrent(); // Format today's date as "DD/MM"

        // Fetch all users and filter based on today's date using DateHelper
        const users = await User.findAll();

        // Filter users whose birthday matches today
        const usersWithBirthdayToday = users.filter(user => {
            const formattedBirthday = DateHelper.validate(user.birthday);
            return formattedBirthday === today;
        });

        res.json({ users: usersWithBirthdayToday });
    } catch (error) {
        console.error("Error fetching users with today's birthday:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/users-to-call-today', async (req, res) => {
    try {
        const today = DateHelper.getCurrent();

        const users = await User.findAll();

        // Filter users with a callDate matching today's date
        const usersToCallToday = users.filter(user => {
            // Use DateHelper to validate and parse the callDate to ensure consistency
            const formattedCallDate = DateHelper.validate(user.callDate);
            const checkDate = DateHelper.isPastDate(user.callDate)
            return (formattedCallDate === today) || (checkDate);
        });

        res.json({ users: usersToCallToday });
    } catch (error) {
        console.error('Error fetching users to call today:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/delete-user/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await deleteUser(id);  // Use the deleteUser function you provided
        if (deleted) {
            res.json({ message: `User with ID ${id} deleted successfully.` });
        } else {
            res.status(404).json({ error: 'User not found.' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/update-callDate/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Calculate the new callDate using DateHelper.sum
        const newCallDate = DateHelper.sum(user.callDate, user.period);
        user.callDate = newCallDate;
        await user.save();

        res.status(200).json({ success: true, message: 'Call date updated', newCallDate });
    } catch (error) {
        console.error('Error updating call date:', error);
        res.status(500).json({ success: false, message: 'Failed to update call date' });
    }
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
