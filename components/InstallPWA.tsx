'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

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
      
      // Show popup after 3 seconds
      setTimeout(() => {
        setShowPopup(true);
      }, 3000);
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
      {/* Install Button (Fixed bottom-right) */}
      {showInstallButton && !isInstalled && (
        <button
          onClick={handleInstallClick}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-bounce"
          aria-label="Install App"
        >
          <Download className="w-5 h-5" />
          <span className="font-medium">Install App</span>
        </button>
      )}

      {/* Install Popup */}
      {showPopup && !isInstalled && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom duration-500 sm:slide-in-from-bottom-0">
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 hover:bg-neutral-700 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-neutral-400" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Smartphone className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-white text-center mb-2">
              Install Chat Generator
            </h3>

            {/* Description */}
            <p className="text-neutral-400 text-center mb-6">
              Install aplikasi ini untuk akses lebih cepat, offline support, dan pengalaman seperti aplikasi native!
            </p>

            {/* Features */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-green-500">✓</span>
                </div>
                <span className="text-neutral-300">Akses cepat dari home screen</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-green-500">✓</span>
                </div>
                <span className="text-neutral-300">Bekerja offline (cached)</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-green-500">✓</span>
                </div>
                <span className="text-neutral-300">Loading lebih cepat</span>
              </div>
            </div>

            {/* Install Instructions for iOS */}
            {isIOS && (
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-400 font-medium mb-2">📱 Cara Install di iOS:</p>
                <ol className="text-xs text-neutral-400 space-y-1 ml-4 list-decimal">
                  <li>Tap tombol <strong>Share</strong> (⎙) di Safari</li>
                  <li>Scroll ke bawah</li>
                  <li>Tap <strong>"Add to Home Screen"</strong></li>
                  <li>Tap <strong>"Add"</strong></li>
                </ol>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {!isIOS && (
                <button
                  onClick={handleInstallClick}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Install Sekarang
                </button>
              )}
              <button
                onClick={handleDismiss}
                className="px-6 py-3 bg-neutral-700 text-neutral-300 font-medium rounded-xl hover:bg-neutral-600 transition-colors"
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
