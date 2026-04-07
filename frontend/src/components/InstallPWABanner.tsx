import { useState, useEffect } from 'react';
import { FiDownload } from 'react-icons/fi';

export default function InstallPWABanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Listen for the event triggered by Chrome when PWA meets criteria
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show the customized install banner
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the native install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    // We've used the prompt, and can't use it again, hide it
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: 'var(--color-primary)',
      color: 'white',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 9999,
      boxShadow: '0 4px 12px rgba(2, 128, 144, 0.3)',
      animation: 'slideDown 0.3s ease-out'
    }}>
      <div style={{ fontSize: '14px', fontWeight: 500 }}>
        Get the MediFind App for a better experience!
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setShowBanner(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          Later
        </button>
        <button 
          onClick={handleInstallClick}
          style={{
            background: 'white',
            color: 'var(--color-primary)',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <FiDownload /> Install
        </button>
      </div>
    </div>
  );
}
