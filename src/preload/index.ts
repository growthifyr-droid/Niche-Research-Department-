/**
 * Electron Preload Script for Niche Research Department
 * Exposes a typed, secure contextBridge API to the renderer.
 * Strictly no nodeIntegration in the renderer.
 */

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import type { AppSettings, DownloadProgress, ElectronAPI, UpdateInfo } from '../types/electron';

const electronAPI: ElectronAPI = {
  isElectron: true,
  getAppVersion: () => ipcRenderer.invoke('app:version'),
  getPlatform: () => ipcRenderer.invoke('app:platform'),
  getUserDataPath: () => ipcRenderer.invoke('app:userDataPath'),

  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized')
  },

  database: {
    getSettings: () => ipcRenderer.invoke('db:getSettings'),
    saveSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
      ipcRenderer.invoke('db:saveSetting', key, value),
    saveAllSettings: (settings: Partial<AppSettings>) =>
      ipcRenderer.invoke('db:saveAllSettings', settings),
    getStats: () => ipcRenderer.invoke('db:getStats'),
    getDbPath: () => ipcRenderer.invoke('db:getDbPath')
  },

  updater: {
    checkForUpdates: (manual?: boolean) => ipcRenderer.invoke('updater:check', manual ?? false),
    downloadUpdate: () => ipcRenderer.invoke('updater:download'),
    installAndRestart: () => ipcRenderer.invoke('updater:install'),

    onChecking: (callback: () => void) => {
      const listener = () => callback();
      ipcRenderer.on('updater:checking', listener);
      return () => {
        ipcRenderer.removeListener('updater:checking', listener);
      };
    },

    onUpdateAvailable: (callback: (info: UpdateInfo) => void) => {
      const listener = (_: IpcRendererEvent, info: UpdateInfo) => callback(info);
      ipcRenderer.on('updater:available', listener);
      return () => {
        ipcRenderer.removeListener('updater:available', listener);
      };
    },

    onUpdateNotAvailable: (callback: (info: UpdateInfo) => void) => {
      const listener = (_: IpcRendererEvent, info: UpdateInfo) => callback(info);
      ipcRenderer.on('updater:not-available', listener);
      return () => {
        ipcRenderer.removeListener('updater:not-available', listener);
      };
    },

    onDownloadProgress: (callback: (progress: DownloadProgress) => void) => {
      const listener = (_: IpcRendererEvent, progress: DownloadProgress) => callback(progress);
      ipcRenderer.on('updater:download-progress', listener);
      return () => {
        ipcRenderer.removeListener('updater:download-progress', listener);
      };
    },

    onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => {
      const listener = (_: IpcRendererEvent, info: UpdateInfo) => callback(info);
      ipcRenderer.on('updater:downloaded', listener);
      return () => {
        ipcRenderer.removeListener('updater:downloaded', listener);
      };
    },

    onError: (callback: (err: { message: string }) => void) => {
      const listener = (_: IpcRendererEvent, err: { message: string }) => callback(err);
      ipcRenderer.on('updater:error', listener);
      return () => {
        ipcRenderer.removeListener('updater:error', listener);
      };
    }
  }
};

// Expose safe API to renderer
contextBridge.exposeInMainWorld('electronAPI', electronAPI);
