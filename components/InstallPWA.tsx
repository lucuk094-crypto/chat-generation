'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Listen for beforeinstallprompt event (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
      
      // Show popup after 5 seconds (less aggressive)
      setTimeout(() => {
        setShowPopup(true);
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if user dismissed before
    const dismissed = localStorage.getItem('pwa-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      if (dismissedTime > oneDayAgo) {
        setShowPopup(false);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowPopup(true);
      }
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowPopup(false);
    }
    
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const handleDismiss = () => {
    setShowPopup(false);
    localStorage.setItem('pwa-dismissed', Date.now().toString());
  };

  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Install Button (Fixed bottom-right) - Matching website style */}
      {showInstallButton && !isInstalled && (
        <button
          onClick={handleInstallClick}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-white text-black font-medium rounded-md shadow-lg hover:bg-neutral-200 transition-all duration-200 text-sm"
          aria-label="Install App"
        >
          <Download className="w-4 h-4" />
          <span>Install App</span>
        </button>
      )}

      {/* Install Popup - Matching website card style */}
      {showPopup && !isInstalled && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-black border border-neutral-800 rounded-lg shadow-xl max-w-md w-full animate-in slide-in-from-bottom duration-500 sm:slide-in-from-bottom-0">
            
            {/* Header */}
            <div className="p-6 pb-4 border-b border-neutral-800">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 rounded-md flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Install App
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Chat Generator PWA
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="p-1.5 hover:bg-neutral-900 rounded-md transition-colors text-neutral-500 hover:text-neutral-300"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Description */}
              <p className="text-sm text-neutral-400 leading-relaxed">
                Install aplikasi ini untuk pengalaman lebih baik dengan akses offline dan loading lebih cepat.
              </p>

              {/* Features */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-neutral-400" />
                  </div>
                  <span className="text-neutral-300">Akses cepat dari home screen</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-neutral-400" />
                  </div>
                  <span className="text-neutral-300">Bekerja offline (cached)</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-neutral-400" />
                  </div>
                  <span className="text-neutral-300">Loading lebih cepat</span>
                </div>
              </div>

              {/* iOS Instructions */}
              {isIOS && (
                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-md">
                  <p className="text-xs text-neutral-400 font-medium mb-2">
                    📱 Cara Install di iOS Safari:
                  </p>
                  <ol className="text-xs text-neutral-500 space-y-1 ml-4 list-decimal">
                    <li>Tap tombol <span className="text-neutral-300">Share (⎙)</span></li>
                    <li>Scroll dan pilih <span className="text-neutral-300">"Add to Home Screen"</span></li>
                    <li>Tap <span className="text-neutral-300">"Add"</span></li>
                  </ol>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 pt-0 flex gap-3">
              {!isIOS && (
                <button
                  onClick={handleInstallClick}
                  className="flex-1 px-4 py-2.5 bg-white text-black font-medium rounded-md hover:bg-neutral-200 transition-all text-sm"
                >
                  Install Sekarang
                </button>
              )}
              <button
                onClick={handleDismiss}
                className={`px-4 py-2.5 bg-neutral-900 text-neutral-300 font-medium rounded-md hover:bg-neutral-800 border border-neutral-800 transition-colors text-sm ${isIOS ? 'flex-1' : ''}`}
              >
                {isIOS ? 'Mengerti' : 'Nanti Saja'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
