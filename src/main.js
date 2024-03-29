const { app, BrowserWindow, ipcMain } = require('electron');
const { name, expressPort } = require('../package.json');
const isDev = require('electron-is-dev');
const electronSquirrelStartup = require('electron-squirrel-startup');
const path = require('node:path');

console.log("PATH INFO", {
  dirname: __dirname,
  home: app.getPath("home"),
  userData: app.getPath("userData"),
  preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
  mainWindow: MAIN_WINDOW_WEBPACK_ENTRY,
})

if (!isDev) {
  require('./express-app.js')();
  console.log("Running in production");
}
else {
  console.log("Running in development");
}

const appName = app.getPath("exe");
const expressAppUrl = `http://127.0.0.1:${expressPort}`;
const WINDOWS_OS = appName.endsWith(`${name}.exe`);
let mainWindow, backgroundWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (electronSquirrelStartup) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 840,
    height: 620,
    title: "Celestron Wifi Password Manager",
    icon: "./public/celestron-small.jpg", // not so sure about this
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