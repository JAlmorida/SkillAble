import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { toast } from 'sonner';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      console.log('🚀 PWA Install prompt available!');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      console.log('✅ PWA installed successfully!');
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      toast.success('🎉 SKILLABLE installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast.success('Installing app...');
      } else {
        toast.info('Install cancelled');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Install error:', error);
      toast.error('Installation failed');
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
            <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Install SKILLABLE
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Get the full app experience!
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="mt-4 flex space-x-2">
        <Button onClick={handleInstallClick} className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Install App
        </Button>
        <Button variant="outline" onClick={handleDismiss} className="flex-1">
          Not Now
        </Button>
      </div>
    </div>
  );
};

export default InstallPWA;