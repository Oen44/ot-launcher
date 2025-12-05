import { contextBridge, shell } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  getConfig: (key) => electronAPI.ipcRenderer.invoke('get-config', key),
  getPos: () => electronAPI.ipcRenderer.invoke('get-window-pos'),
  move: (dx, dy, base) => electronAPI.ipcRenderer.send('move-window', { dx, dy, base }),
  setIgnore: (v) => electronAPI.ipcRenderer.invoke('set-ignore', v),
  close: () => electronAPI.ipcRenderer.invoke('close-window'),
  openExternal: (url) => shell.openExternal(url),
  writeFile: (path, data) => electronAPI.ipcRenderer.invoke('write-file', path, data),
  startGame: (executable) => electronAPI.ipcRenderer.invoke('start-game', executable),
  cleanClient: (manifest) => electronAPI.ipcRenderer.invoke('clean-client', manifest),
  readClientFiles: () => electronAPI.ipcRenderer.invoke('read-client-files')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
