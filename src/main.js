require('./express-app.js');
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { name, expressPort } = require('../package.json');

const appName = app.getPath("exe");
const expressAppUrl = `http://127.0.0.1:${expressPort}`;
const WINDOWS_OS = appName.endsWith(`${name}.exe`);
let mainWindow, backgroundWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 840,
    height: 620,
    title: "Celestron Wifi Password Manager",
    icon: "./public/celestron-small.jpg",
    autoHideMenuBar: true,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow);
app.whenReady().then(() => {
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});