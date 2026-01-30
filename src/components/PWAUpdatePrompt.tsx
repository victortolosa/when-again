'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from './ui/button';

export function PWAUpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Check for updates every 60 seconds
    const checkForUpdates = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
        }
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    };

    const interval = setInterval(checkForUpdates, 60000);

    // Listen for service worker updates
    const handleControllerChange = () => {
      // Only reload if we initiated the update, don't show prompt again
      if (isUpdatingRef.current) {
        window.location.reload();
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    // Check if there's a waiting service worker
    navigator.serviceWorker.ready.then((reg) => {
      if (reg.waiting) {
        setRegistration(reg);
        setShowPrompt(true);
      }

      // Listen for new service workers
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setRegistration(reg);
              setShowPrompt(true);
            }
          });
        }
      });
    });

    return () => {
      clearInterval(interval);
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      isUpdatingRef.current = true;
      setShowPrompt(false);

      // Tell the waiting service worker to skip waiting and become active
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });

      // The page will reload when controllerchange event fires
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
      <div className="bg-card border shadow-lg rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🔄</div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Update Available</h3>
            <p className="text-xs text-muted-foreground mt-1">
              A new version of DateKeeper is ready to install.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={handleUpdate}
          >
            Update Now
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
          >
            Later
          </Button>
        </div>
      </div>
    </div>
  );
}
