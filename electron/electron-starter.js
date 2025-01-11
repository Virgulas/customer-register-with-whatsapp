const { app, BrowserWindow } = require('electron');
const isDev = true;
const waitOn = require('wait-on');
const path = require('path');

let mainWindow;

async function createWindow() {
    try {
        mainWindow = new BrowserWindow({
            width: 1024,
            height: 768,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js') // Ensure preload.js exists
            },
        });

        const startUrl = isDev
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, '../build/index.html')}`;

        console.log(`Waiting for: ${startUrl}`);

        try {
            await waitOn({ resources: [startUrl], timeout: 30000 }); // 30s timeout
            console.log('React app is ready. Loading URL...');
        } catch (error) {
            console.error(`Failed to wait for ${startUrl}:`, error);
            app.quit(); // Quit the app if the URL is not available
            return;
        }

        await mainWindow.loadURL(startUrl);
        if (isDev) {
            mainWindow.webContents.openDevTools();
        }

        mainWindow.on('closed', () => (mainWindow = null));
    } catch (error) {
        console.error('Error creating the Electron window:', error);
    }
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
