import { useGetSettingsQuery, useUpdateSettingsMutation } from '@/features/api/userApi';
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const ZoomContext = createContext();

// Custom hook to use the Zoom context
export const useZoom = () => {
  const context = useContext(ZoomContext);
  if (!context) {
    throw new Error('useZoom must be used within a ZoomProvider');
  }
  return context;
};

// Provider component
export const ZoomProvider = ({ children, user }) => {
  const { data: settings, isSuccess } = useGetSettingsQuery(undefined, { skip: !user });
  const [updateSettings] = useUpdateSettingsMutation();

  const getKey = (key) => `${user?.id || "guest"}_${key}`;
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.5);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedZoomEnabled = localStorage.getItem(getKey('zoomEnabled'));
    const savedZoomLevel = localStorage.getItem(getKey('zoomLevel'));
    if (savedZoomEnabled !== null) setIsZoomEnabled(JSON.parse(savedZoomEnabled));
    if (savedZoomLevel !== null) setZoomLevel(parseFloat(savedZoomLevel));
  }, [user]);

  // Load preferences from backend
  useEffect(() => {
    if (isSuccess && settings) {
      setIsZoomEnabled(settings.zoomEnabled ?? false);
      setZoomLevel(settings.zoomLevel ?? 1.5);
    }
  }, [isSuccess, settings]);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem(getKey('zoomEnabled'), JSON.stringify(isZoomEnabled));
  }, [isZoomEnabled, user]);

  useEffect(() => {
    localStorage.setItem(getKey('zoomLevel'), zoomLevel.toString());
  }, [zoomLevel, user]);

  // Persist preferences to backend
  useEffect(() => {
    if (!user || !isSuccess) return;
    updateSettings({
      zoomEnabled: isZoomEnabled,
      zoomLevel: zoomLevel,
    });
  }, [isZoomEnabled, zoomLevel, user, isSuccess, updateSettings]);

  // Keyboard shortcut support (Ctrl+M or Cmd+M)
  useEffect(() => {
    const handleKeyPress = (event) => {
      if ((event.key === 'M' || event.key === 'm') && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        setIsZoomEnabled(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

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