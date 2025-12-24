import { app, shell, BrowserWindow, ipcMain } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs'
import crypto from 'crypto'
import __Store from 'electron-store'
const Store = __Store.default || __Store

import icon from '../../resources/icon.png?asset'
import config from '../../launcher-config.json'

const store = new Store({
  defaults: {
    selectedClient: '64-bit OpenGL',
    autoPlay: false,
    closeOnLaunch: false
  }
})

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    resizable: false,
    frame: false,
    show: false,
    transparent: true,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  if (is.dev)
    mainWindow.webContents.openDevTools()

  return mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const win = createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  ipcMain.handle('get-window-pos', () => {
    if (!win) return [0, 0]
    return win.getPosition()
  })

  ipcMain.on('move-window', (event, { dx, dy, base }) => {
    if (!win) return
    win.setPosition(base[0] + dx, base[1] + dy)
  })

  ipcMain.handle('set-ignore', (e, ignore) => {
    win.setIgnoreMouseEvents(ignore, { forward: true })
  })

  ipcMain.handle('close-window', () => {
    win.close()
  })

  ipcMain.handle('get-config', (e, key) => {
    return config[key]
  })

  ipcMain.handle('write-file', async (e, relativePath, data) => {
    const sessionPath = app.isPackaged ? app.getPath('userData') : app.getAppPath()
    const filePath = join(sessionPath, 'otclient', relativePath)
    const dirname = path.dirname(filePath)
    const exist = await directoryExists(dirname)
    if (!exist) {
      await fs.promises.mkdir(dirname, { recursive: true })
    }

    await fs.promises.writeFile(filePath, Buffer.from(data))
  })

  ipcMain.handle('start-game', () => {
    const sessionPath = app.isPackaged ? app.getPath('userData') : app.getAppPath()
    const clientPath = join(sessionPath, 'otclient', config.CLIENTS[store.get('selectedClient')])
    shell.openPath(clientPath)

    if (store.get('closeOnLaunch') && !store.get('autoPlay')) {
      win.close()
    }
  })

  ipcMain.handle('clean-client', async (e, manifest) => {
    const sessionPath = app.isPackaged ? app.getPath('userData') : app.getAppPath()
    const clientDir = join(sessionPath, 'otclient')

    const exists = await directoryExists(clientDir)
    if (!exists) return

    const files = await fs.promises.readdir(clientDir, { withFileTypes: true, recursive: true })
    for (const file of files) {
      if (file.isFile()) {
        const filePath = path.join(file.path, file.name)
        const relativeFilePath = path.relative(clientDir, filePath).replace(/\\/g, '/')
        if (!manifest[relativeFilePath]) {
          await fs.promises.unlink(join(clientDir, relativeFilePath))
        }
      }
    }
  })

  ipcMain.handle('read-client-files', async () => {
    const sessionPath = app.isPackaged ? app.getPath('userData') : app.getAppPath()
    const clientDir = join(sessionPath, 'otclient')

    const exists = await directoryExists(clientDir)
    if (!exists) return {}

    const files = await fs.promises.readdir(clientDir, { withFileTypes: true, recursive: true })
    const localFiles = {}

    const tasks = files.map(
      (file) =>
        new Promise((resolve, reject) => {
          if (file.isFile()) {
            try {
              const filePath = path.join(file.path, file.name)
              const relativeFilePath = path.relative(clientDir, filePath).replace(/\\/g, '/')
              const hash = crypto.createHash('md5')
              const stream = fs.createReadStream(filePath)

              stream.on('data', (data) => hash.update(data))
              stream.on('end', () => {
                localFiles[relativeFilePath] = {
                  size: fs.statSync(filePath).size,
                  hash: hash.digest('hex')
                }
                resolve()
              })
              stream.on('error', reject)
            } catch (err) {
              reject(err)
            }
          } else {
            resolve()
          }
        })
    )

    await Promise.all(tasks)
    return localFiles
  })

  ipcMain.handle('get-setting', (e, key) => {
    return store.get(key)
  })

  ipcMain.handle('set-setting', (e, key, value) => {
    store.set(key, value)
  })
})

async function directoryExists(dirname) {
  try {
    await fs.promises.access(dirname)
    return true
  } catch {
    return false
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
