'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Disable static generation for this debug page
export const dynamic = 'force-dynamic';

function PWADebugPage() {
  // Lazy import pwa-utils on client side only
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pwaUtils, setPwaUtils] = useState<any>(null);

  useEffect(() => {
    import('@/lib/pwa-utils').then((utils) => {
      setPwaUtils(utils);
    });
  }, []);

  if (!pwaUtils) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="text-muted-foreground">Loading debug tools...</div>
      </div>
    );
  }



  return <PWADebugContent pwaUtils={pwaUtils} />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PWADebugContent({ pwaUtils }: { pwaUtils: any }) {
  const {
    isPWA,
    isOnline,
    unregisterServiceWorkers,
    clearAllCaches,
    getCurrentServiceWorker,
    forceServiceWorkerUpdate,
    getCacheSize,
    formatBytes,
    pwaDebug,
  } = pwaUtils;
  const [isPWAMode, setIsPWAMode] = useState(false);
  const [online, setOnline] = useState(true);
  const [swState, setSWState] = useState<string>('Checking...');
  const [cacheSize, setCacheSize] = useState<string>('Calculating...');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setTimeout(() => {
      setIsPWAMode(isPWA());
      setOnline(isOnline());
    }, 0);

    const checkSW = async () => {
      const sw = await getCurrentServiceWorker();
      setSWState(sw ? sw.state : 'Not registered');
    };

    const checkCache = async () => {
      const size = await getCacheSize();
      setCacheSize(formatBytes(size));
    };

    checkSW();
    checkCache();

    const interval = setInterval(() => {
      setOnline(isOnline());
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUnregisterSW = async () => {
    try {
      await unregisterServiceWorkers();
      addLog('Service workers unregistered');
      setSWState('Not registered');
    } catch (error) {
      addLog(`Error: ${error}`);
    }
  };

  const handleClearCaches = async () => {
    try {
      await clearAllCaches();
      addLog('All caches cleared');
      const size = await getCacheSize();
      setCacheSize(formatBytes(size));
    } catch (error) {
      addLog(`Error: ${error}`);
    }
  };

  const handleForceUpdate = async () => {
    try {
      await forceServiceWorkerUpdate();
      addLog('Service worker update initiated');
    } catch (error) {
      addLog(`Error: ${error}`);
    }
  };

  const handleLogSWState = async () => {
    await pwaDebug.logServiceWorkerState();
    addLog('Service worker state logged to console');
  };

  const handleLogCaches = async () => {
    await pwaDebug.logCacheContents();
    addLog('Cache contents logged to console');
  };

  const handleLogPWAInfo = () => {
    pwaDebug.logPWAInfo();
    addLog('PWA info logged to console');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">PWA Debug Console</h1>
          <p className="text-muted-foreground">
            Debug and test PWA functionality
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Mode:</span>
                <span className={isPWAMode ? 'text-green-500' : 'text-orange-500'}>
                  {isPWAMode ? 'PWA (Standalone)' : 'Browser'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Network:</span>
                <span className={online ? 'text-green-500' : 'text-red-500'}>
                  {online ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Service Worker:</span>
                <span className="font-mono">{swState}</span>
              </div>
              <div className="flex justify-between">
                <span>Cache Size:</span>
                <span className="font-mono">{cacheSize}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-2">Support</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Service Workers:</span>
                <span className="text-green-500">
                  {'serviceWorker' in navigator ? '✓ Supported' : '✗ Not supported'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cache API:</span>
                <span className="text-green-500">
                  {'caches' in window ? '✓ Supported' : '✗ Not supported'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Notifications:</span>
                <span className="text-green-500">
                  {'Notification' in window ? '✓ Supported' : '✗ Not supported'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-4">
          <h3 className="font-semibold mb-3">Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <Button size="sm" onClick={handleForceUpdate} variant="outline">
              Force Update
            </Button>
            <Button size="sm" onClick={handleLogSWState} variant="outline">
              Log SW State
            </Button>
            <Button size="sm" onClick={handleLogCaches} variant="outline">
              Log Caches
            </Button>
            <Button size="sm" onClick={handleLogPWAInfo} variant="outline">
              Log PWA Info
            </Button>
            <Button
              size="sm"
              onClick={handleClearCaches}
              variant="outline"
              className="text-orange-500"
            >
              Clear Caches
            </Button>
            <Button
              size="sm"
              onClick={handleUnregisterSW}
              variant="outline"
              className="text-red-500"
            >
              Unregister SW
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-3">Activity Log</h3>
          <div className="bg-muted rounded p-3 h-48 overflow-auto font-mono text-xs space-y-1">
            {logs.length === 0 ? (
              <div className="text-muted-foreground">No activity yet</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="text-foreground">
                  {log}
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-4 bg-muted">
          <h3 className="font-semibold mb-2">Testing Guide</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>1. <strong>Test Offline Mode:</strong> Turn off network in DevTools to see offline indicator</p>
            <p>2. <strong>Test Updates:</strong> Deploy new version and wait for update prompt</p>
            <p>3. <strong>Test Install:</strong> Visit in browser to see install prompt</p>
            <p>4. <strong>Test Error Boundary:</strong> Throw error in component to see error screen</p>
            <p>5. <strong>Check Console:</strong> Open DevTools console for detailed logs</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default PWADebugPage;
