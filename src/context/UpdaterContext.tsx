/**
 * Auto-Updater Context for Niche Research Department
 * Subscribes to real IPC events from electron-updater and coordinates UI indicators
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { electronBridge } from '../services/electronBridge';
import { useToast } from './ToastContext';
import type { DownloadProgress, UpdateInfo, UpdaterState } from '../types/electron';

interface UpdaterContextType {
  state: UpdaterState;
  currentVersion: string;
  isUpdateAvailable: boolean;
  checkForUpdates: (manual?: boolean) => Promise<void>;
  downloadUpdate: () => Promise<void>;
  installAndRestart: () => void;
  dismissBanner: () => void;
  isBannerVisible: boolean;
}

const UpdaterContext = createContext<UpdaterContextType | undefined>(undefined);

export const UpdaterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [currentVersion, setCurrentVersion] = useState<string>('1.0.0');
  const [isBannerVisible, setIsBannerVisible] = useState<boolean>(false);

  const [state, setState] = useState<UpdaterState>({
    status: 'idle',
    info: null,
    progress: null,
    error: null,
    lastChecked: null
  });

  // Load app version
  useEffect(() => {
    electronBridge.getAppVersion().then(v => {
      if (v) setCurrentVersion(v);
    });
  }, []);

  // Listen to IPC updater events
  useEffect(() => {
    const unsubChecking = electronBridge.updater.onChecking(() => {
      setState(prev => ({
        ...prev,
        status: 'checking',
        error: null,
        lastChecked: new Date().toLocaleTimeString()
      }));
    });

    const unsubAvailable = electronBridge.updater.onUpdateAvailable((info: UpdateInfo) => {
      setState(prev => ({
        ...prev,
        status: 'available',
        info,
        error: null,
        lastChecked: new Date().toLocaleTimeString()
      }));
      setIsBannerVisible(true);

      showToast({
        title: 'Update Available',
        message: `Version ${info.version} is available for download.`,
        type: 'update',
        duration: 8000,
        action: {
          label: 'Download Now',
          onClick: () => {
            electronBridge.updater.downloadUpdate();
          }
        }
      });
    });

    const unsubNotAvailable = electronBridge.updater.onUpdateNotAvailable((info: UpdateInfo) => {
      setState(prev => ({
        ...prev,
        status: 'not-available',
        info,
        error: null,
        lastChecked: new Date().toLocaleTimeString()
      }));
    });

    const unsubProgress = electronBridge.updater.onDownloadProgress((progress: DownloadProgress) => {
      setState(prev => ({
        ...prev,
        status: 'downloading',
        progress
      }));
    });

    const unsubDownloaded = electronBridge.updater.onUpdateDownloaded((info: UpdateInfo) => {
      setState(prev => ({
        ...prev,
        status: 'downloaded',
        info,
        progress: null
      }));
      setIsBannerVisible(true);

      showToast({
        title: 'Update Ready to Install',
        message: `Version ${info.version} has been downloaded. Restart to apply.`,
        type: 'success',
        duration: 0, // Stay until dismissed
        action: {
          label: 'Install & Restart',
          onClick: () => {
            electronBridge.updater.installAndRestart();
          }
        }
      });
    });

    const unsubError = electronBridge.updater.onError((err: { message: string }) => {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: err.message,
        lastChecked: new Date().toLocaleTimeString()
      }));

      showToast({
        title: 'Update Notification',
        message: err.message || 'Unable to reach update server.',
        type: 'warning',
        duration: 6000
      });
    });

    return () => {
      unsubChecking();
      unsubAvailable();
      unsubNotAvailable();
      unsubProgress();
      unsubDownloaded();
      unsubError();
    };
  }, [showToast]);

  const checkForUpdates = useCallback(async (manual: boolean = true) => {
    setState(prev => ({ ...prev, status: 'checking', error: null }));
    await electronBridge.updater.checkForUpdates(manual);
  }, []);

  const downloadUpdate = useCallback(async () => {
    setState(prev => ({ ...prev, status: 'downloading', error: null }));
    await electronBridge.updater.downloadUpdate();
  }, []);

  const installAndRestart = useCallback(() => {
    electronBridge.updater.installAndRestart();
  }, []);

  const dismissBanner = useCallback(() => {
    setIsBannerVisible(false);
  }, []);

  const isUpdateAvailable = state.status === 'available' || state.status === 'downloading' || state.status === 'downloaded';

  return (
    <UpdaterContext.Provider
      value={{
        state,
        currentVersion,
        isUpdateAvailable,
        checkForUpdates,
        downloadUpdate,
        installAndRestart,
        dismissBanner,
        isBannerVisible
      }}
    >
      {children}
    </UpdaterContext.Provider>
  );
};

export function useUpdater(): UpdaterContextType {
  const context = useContext(UpdaterContext);
  if (!context) {
    throw new Error('useUpdater must be used within an UpdaterProvider');
  }
  return context;
}
