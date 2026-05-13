import { Platform } from 'react-native';

const shadowStyle = (elevation: number, color = 'rgba(27,94,32,0.15)') => {
  if (Platform.OS === 'android') {
    return { elevation };
  }
  const blur = elevation * 3;
  const spread = elevation * 0.5;
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: elevation },
    shadowOpacity: 0.25,
    shadowRadius: blur,
  };
};

export const Shadows = {
  sm: shadowStyle(2),
  md: shadowStyle(4),
  lg: shadowStyle(8),
  xl: shadowStyle(12),
  card: {
    ...shadowStyle(6),
    ...(Platform.OS !== 'android' && {
      shadowColor: 'rgba(27,94,32,0.18)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
    }),
  },
  tabBar: {
    ...shadowStyle(16),
    ...(Platform.OS !== 'android' && {
      shadowColor: 'rgba(0,0,0,0.15)',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
    }),
  },
  fab: {
    ...shadowStyle(10),
    ...(Platform.OS !== 'android' && {
      shadowColor: 'rgba(27,94,32,0.4)',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.45,
      shadowRadius: 16,
    }),
  },
};
