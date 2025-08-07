import { useGetSettingsQuery, useUpdateSettingsMutation } from '@/features/api/userApi';
import React, { createContext, useContext, useState, useEffect } from 'react';

const ZoomContext = createContext();

export const useZoom = () => {
  const context = useContext(ZoomContext);
  if (!context) {
    throw new Error('useZoom must be used within a ZoomProvider');
  }
  return context;
};

export const ZoomProvider = ({ children, user }) => {
  const { data: settings, isSuccess } = useGetSettingsQuery(undefined, { skip: !user });
  const [updateSettings] = useUpdateSettingsMutation();

  const getKey = (key) => `${user?.id || "guest"}_${key}`;
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.5);

  useEffect(() => {
    const savedZoomEnabled = localStorage.getItem(getKey('zoomEnabled'));
    const savedZoomLevel = localStorage.getItem(getKey('zoomLevel'));
    if (savedZoomEnabled !== null) setIsZoomEnabled(JSON.parse(savedZoomEnabled));
    if (savedZoomLevel !== null) setZoomLevel(parseFloat(savedZoomLevel));
  }, [user]);

  useEffect(() => {
    if (isSuccess && settings) {
      setIsZoomEnabled(settings.zoomEnabled ?? false);
      setZoomLevel(settings.zoomLevel ?? 1.5);
    }
  }, [isSuccess, settings]);

  useEffect(() => {
    localStorage.setItem(getKey('zoomEnabled'), JSON.stringify(isZoomEnabled));
  }, [isZoomEnabled, user]);

  useEffect(() => {
    localStorage.setItem(getKey('zoomLevel'), zoomLevel.toString());
  }, [zoomLevel, user]);

  useEffect(() => {
    if (!user || !isSuccess) return;
    updateSettings({
      zoomEnabled: isZoomEnabled,
      zoomLevel: zoomLevel,
    });
  }, [isZoomEnabled, zoomLevel, user, isSuccess, updateSettings]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && (event.key === 'M' || event.key === 'm')) {
        event.preventDefault();
        toggleZoom();
      }
      
      if (event.altKey && event.key === '+') {
        event.preventDefault();
        if (isZoomEnabled) {
          const newLevel = Math.min(zoomLevel + 0.1, 3.0);
          updateZoomLevel(newLevel);
        }
      }
      
      if (event.altKey && event.key === '-') {
        event.preventDefault();
        if (isZoomEnabled) {
          const newLevel = Math.max(zoomLevel - 0.1, 0.5);
          updateZoomLevel(newLevel);
        }
      }
      
      if (event.altKey && event.key === '0') {
        event.preventDefault();
        if (isZoomEnabled) {
          updateZoomLevel(1.0);
        }
      }
      
      if ((event.ctrlKey || event.metaKey) && event.altKey && event.key === 'z') {
        event.preventDefault();
        toggleZoom();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isZoomEnabled, zoomLevel]);

  const toggleZoom = () => setIsZoomEnabled(prev => !prev);
  const updateZoomLevel = (level) => setZoomLevel(level);

  const value = {
    isZoomEnabled,
    zoomLevel,
    toggleZoom,
    updateZoomLevel,
    setIsZoomEnabled,
    setZoomLevel
  };

  return (
    <ZoomContext.Provider value={value}>
      {children}
    </ZoomContext.Provider>
  );
}; 