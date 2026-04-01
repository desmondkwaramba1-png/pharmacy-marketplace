/**
 * Haversine formula to calculate distance between two geo-coordinates
 * Returns distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Format distance for display: e.g. "1.2 km" or "850 m"
 */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

/**
 * Filter pharmacies within a given radius (km)
 */
export function filterByRadius<T extends { latitude: number; longitude: number }>(
  items: T[],
  userLat: number,
  userLng: number,
  radiusKm: number
): (T & { distance: number })[] {
  return items
    .map((item) => ({
      ...item,
      distance: haversineDistance(userLat, userLng, item.latitude, item.longitude),
    }))
    .filter((item) => item.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}
