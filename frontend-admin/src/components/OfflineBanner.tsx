import { useNetwork } from '../hooks/useNetwork';
import { FiWifiOff } from 'react-icons/fi';

export default function OfflineBanner() {
  const { isOnline } = useNetwork();
  if (isOnline) return null;
  return (
    <div className="offline-banner" role="alert">
      <FiWifiOff size={18} />
      <span>You're offline — showing cached results</span>
    </div>
  );
}
