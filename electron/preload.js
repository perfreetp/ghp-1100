const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  onAlarm: (callback) => ipcRenderer.on('alarm:new', (_, data) => callback(data)),
  removeAlarmListener: () => ipcRenderer.removeAllListeners('alarm:new')
})
