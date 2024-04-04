const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { name, expressPort } = require('../package.json');
const startExpressApp = require('./express-app');
const electronSquirrelStartup = require('electron-squirrel-startup');
const path = require('node:path');
const fs = require('node:fs');


if (app.isPackaged) {
  console.log('running in production')
  const userDataFile = "user-data.json";
  const userDataPath = app.getPath('userData');
  const fullPath = path.join(userDataPath, userDataFile);
  fs.open(fullPath, 'r', (err, fd) => {
    if (err) {
      // file didn't exist, create it
      console.log("couldn't find user data path, creating it at ", fullPath);
      fs.writeFile(fullPath, JSON.stringify({lastAddress: '1.2.3.4', sandboxValue: 0}), (err) => console.error(err));
    }
    else {
      console.log('found user data path', fullPath);
    }
  });

  startExpressApp(userDataPath);
}
else {
  console.log('running in development')
  console.log("PATH INFO", {
    dirname: __dirname,
    home: app.getPath("home"),
    userData: app.getPath("userData"),
    preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    mainWindow: MAIN_WINDOW_WEBPACK_ENTRY,
  })
}

const appName = app.getPath("exe");
const expressAppUrl = `http://127.0.0.1:${expressPort}`;
const WINDOWS_OS = appName.endsWith(`${name}.exe`);
let mainWindow, splashScreen;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (electronSquirrelStartup) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 860,
    height: 575,
    title: "Celestron Wifi Password Manager",
    icon: path.join(__dirname, "./celestron.ico"),
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      // there is a way to avoid doing this, but this is the fast way
      // to integrate ipcRenderer into the frontend code (not exclusively a React problem)
      // nodeIntegration: true,
      // contextIsolation: false,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (app.isPackaged) {
    mainWindow.setMenu(null);
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Splash Screen
  splashScreen = new BrowserWindow({
    width: 500,
    height: 300,
    frame: false,
    alwaysOnTop: true
  })

  splashScreen.loadFile(path.join(__dirname, "./splash.html"));
  splashScreen.center();

  // because our ipcMain isn't working, we'll use this temporarily
  // setTimeout(() => {
  //     mainWindow.center();
  //     mainWindow.show();
  //     splashScreen.close();
  //     splashScreen = null;
  // }, 5000);
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

// IPC Methods
ipcMain.on('react-ready', (event, arg) => {
  if (splashScreen) {
    // add a short timeout in case it was loaded really fast
    setTimeout(() => {
      mainWindow.center();
      mainWindow.show();
      splashScreen.close();
      splashScreen = null;
    }, 2000);
  }
})

ipcMain.on('open-url', (event, arg) => {
  shell.openExternal(arg);
})