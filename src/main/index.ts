/**
 * Main Process Entry Point for Niche Research Department
 * 
 * Mandates:
 * - Single Instance Lock
 * - Secure Context Isolation (Preload contextBridge only)
 * - Safe User Data Storage in app.getPath('userData')
 * - Window size/position persistence
 * - In-App Auto-Updater integration
 */

import { app, BrowserWindow, ipcMain, screen } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { DatabaseManager } from './database';
import { UpdaterManager } from './updater';
import type { AppSettings } from '../types/electron';

// 1. Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  console.log('[Main] Another instance is already running. Quitting.');
  app.quit();
  process.exit(0);
}

let mainWindow: BrowserWindow | null = null;
let dbManager: DatabaseManager;
let updaterManager: UpdaterManager;

interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized: boolean;
}

function getWindowStateFilePath(): string {
  return path.join(app.getPath('userData'), 'window-state.json');
}

function loadWindowState(): WindowState {
  const defaults: WindowState = {
    width: 1400,
    height: 900,
    isMaximized: false
  };

  try {
    const filePath = getWindowStateFilePath();
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      // Validate within current display bounds
      const primaryDisplay = screen.getPrimaryDisplay();
      const bounds = primaryDisplay.bounds;

      if (data.width && data.width >= 1280 && data.height && data.height >= 800) {
        defaults.width = Math.min(data.width, bounds.width);
        defaults.height = Math.min(data.height, bounds.height);
      }
      if (typeof data.x === 'number' && typeof data.y === 'number') {
        if (data.x >= 0 && data.x < bounds.width && data.y >= 0 && data.y < bounds.height) {
          defaults.x = data.x;
          defaults.y = data.y;
        }
      }
      defaults.isMaximized = Boolean(data.isMaximized);
    }
  } catch (err) {
    console.warn('[Main] Could not read window-state.json, using defaults:', err);
  }

  return defaults;
}

function saveWindowState(): void {
  if (!mainWindow) return;
  try {
    const isMaximized = mainWindow.isMaximized();
    const bounds = isMaximized ? mainWindow.getNormalBounds() : mainWindow.getBounds();
    const state: WindowState = {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      isMaximized
    };
    fs.writeFileSync(getWindowStateFilePath(), JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Main] Failed to save window state:', err);
  }
}

async function createWindow(): Promise<void> {
  const windowState = loadWindowState();

  // Create BrowserWindow with high-end desktop attributes
  mainWindow = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    minWidth: 1280,
    minHeight: 800,
    frame: false, // Professional custom frameless window title bar
    titleBarStyle: 'hidden',
    backgroundColor: '#090D16',
    show: false, // Show once ready-to-show for zero visual flicker
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      spellcheck: false
    }
  });

  if (windowState.isMaximized) {
    mainWindow.maximize();
  }

  // Gracefully reveal window
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    console.log('[Main] Main window revealed.');
  });

  // Track state on close
  mainWindow.on('close', () => {
    saveWindowState();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Bind updater to window
  updaterManager.setWindow(mainWindow);

  // Load URL or dist bundle
  const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000';
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    console.log(`[Main] Loading dev server: ${devUrl}`);
    await mainWindow.loadURL(devUrl);
  } else {
    const indexPath = path.join(__dirname, '../../dist/index.html');
    if (fs.existsSync(indexPath)) {
      console.log(`[Main] Loading production build: ${indexPath}`);
      await mainWindow.loadFile(indexPath);
    } else {
      console.log(`[Main] Falling back to devUrl: ${devUrl}`);
      await mainWindow.loadURL(devUrl);
    }
  }

  // Silent update check 3 seconds after app launch (non-blocking)
  setTimeout(() => {
    console.log('[Main] Running silent startup update check...');
    updaterManager.checkForUpdates(false);
  }, 3500);
}

// Second instance focus
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

// App Lifecycle
app.whenReady().then(async () => {
  console.log('[Main] Electron app initialized. Platform:', process.platform);

  // Initialize DB in app.getPath('userData')
  dbManager = DatabaseManager.getInstance();

  // Initialize Auto-Updater
  updaterManager = UpdaterManager.getInstance();

  // Register General IPC Handlers
  registerAppIpc();

  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    dbManager?.close();
    app.quit();
  }
});

// Register IPC handlers
function registerAppIpc(): void {
  // App Info
  ipcMain.handle('app:version', () => app.getVersion());
  ipcMain.handle('app:platform', () => process.platform);
  ipcMain.handle('app:userDataPath', () => app.getPath('userData'));

  // Window Controls
  ipcMain.handle('window:minimize', () => {
    mainWindow?.minimize();
  });

  ipcMain.handle('window:maximize', () => {
    if (!mainWindow) return;
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.handle('window:close', () => {
    mainWindow?.close();
  });

  ipcMain.handle('window:isMaximized', () => {
    return mainWindow ? mainWindow.isMaximized() : false;
  });

  // Database / Settings IPC
  ipcMain.handle('db:getSettings', () => {
    return dbManager.getSettings();
  });

  ipcMain.handle('db:saveSetting', (_, key: keyof AppSettings, value: any) => {
    return dbManager.saveSetting(key, value);
  });

  ipcMain.handle('db:saveAllSettings', (_, settings: Partial<AppSettings>) => {
    return dbManager.saveAllSettings(settings);
  });

  ipcMain.handle('db:getStats', () => {
    return dbManager.getStats();
  });

  ipcMain.handle('db:getDbPath', () => {
    return dbManager.getDbPath();
  });
}
