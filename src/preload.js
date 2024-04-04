// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const {contextBridge, ipcRenderer} = require('electron');
const NAME = 'electronApi';

const api = {
  openUrl: (url) => ipcRenderer.send('open-url', url),
  signal: (signalName) => ipcRenderer.send(signalName)
}

contextBridge.exposeInMainWorld(NAME, api);
