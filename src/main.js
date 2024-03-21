const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('node:child_process');
const path = require('node:path');
const { name, expressPort } = require('../package.json');

const appName = app.getPath("exe");
const expressAppUrl = `http://127.0.0.1:${expressPort}`;
let mainWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// deal with express server stdout and stderr
const expressPath = appName.endsWith(`${name}.exe`)
  ? path.join("./resources/app.asar", "./src/express-app.js")
  : "./src/express-app.js";

function stripAnsiColors(text) {
  return text.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ""
  );
}

function redirectOutput(stream) {
  stream.on("data", (data) => {
    if (!mainWindow) return;
    data.toString().split("\n").forEach((line) => {
      console.log("\tline: ", line)
      if (line !== "") {
        mainWindow?.webContents?.send("server-log-entry", stripAnsiColors(line));
      }
    });
  });
}

const createWindow = () => {
  console.log("Spawning express on: ", expressPath);
  console.log('other info about paths...')
  console.log('dirname: ', __dirname)
  console.log('appName: ', appName)
  console.log('name: ', name)
  console.log('appName ends with {name}.exe?: ', appName.endsWith(`${name}.exe`))
  // spawn express app as a process
  const expressAppProcess = spawn('node', [expressPath], { env: { ELECTRON_RUN_AS_NODE: "1", DISPLAY: "127.0.0.1:0.0" } });
  [expressAppProcess.stdout, expressAppProcess.stderr].forEach(redirectOutput);

  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
  console.log("Spawned process: ", JSON.stringify(expressAppProcess));
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
    // expressAppProcess.kill();
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow);
app.whenReady().then(() => {
  console.log("ARE YOU READY?????????????????")
  console.log(JSON.stringify(mainWindow));
  console.log("??????????????????????????")
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
