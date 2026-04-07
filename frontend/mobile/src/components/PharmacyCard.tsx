import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { Pharmacy } from '../types';
import { theme } from '../theme';

interface Props {
  pharmacy: Pharmacy;
  onPress?: () => void;
}

export default function PharmacyCard({ pharmacy, onPress }: Props) {
  const openDirections = (e: any) => {
    e?.stopPropagation();
    const lat = pharmacy.latitude;
    const lng = pharmacy.longitude;
    const query = `${pharmacy.name} ${pharmacy.address} Zimbabwe`;
    
    const url = Platform.select({
      ios: `maps:${lat},${lng}?q=${query}`,
      android: `geo:${lat},${lng}?q=${query}`
    });
    
    if (url) Linking.openURL(url);
  };

  const callPharmacy = (e: any) => {
    e?.stopPropagation();
    if (pharmacy.phone) {
      Linking.openURL(`tel:${pharmacy.phone}`);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7} disabled={!onPress}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <FontAwesome5 name="clinic-medical" size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{pharmacy.name}</Text>
          <Text style={styles.address}>{pharmacy.address}</Text>
          {pharmacy.suburb ? <Text style={styles.address}>{pharmacy.suburb}, {pharmacy.city}</Text> : null}
        </View>
      </View>
      
      <View style={styles.row}>
        {pharmacy.distance != null && (
          <View style={styles.chip}>
            <FontAwesome5 name="map-marker-alt" size={12} color={theme.colors.textSecondary} />
            <Text style={styles.chipText}>
              {pharmacy.distance < 1 ? `${Math.round(pharmacy.distance * 1000)}m` : `${pharmacy.distance.toFixed(1)}km`}
            </Text>
          </View>
        )}
        {pharmacy.phone && (
          <View style={styles.chip}>
            <Feather name="phone" size={12} color={theme.colors.textSecondary} />
            <Text style={styles.chipText}>{pharmacy.phone}</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {pharmacy.phone && (
          <TouchableOpacity style={styles.btnOutline} onPress={callPharmacy}>
            <Feather name="phone" size={14} color={theme.colors.primary} />
            <Text style={styles.btnText}>Call</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.btnOutline} onPress={openDirections}>
          <FontAwesome5 name="map-marker-alt" size={14} color={theme.colors.primary} />
          <Text style={styles.btnText}>Directions</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radii.xl,
    padding: theme.layout.screenPadding,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: theme.radii.lg,
    backgroundColor: 'rgba(2,128,144,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  address: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bg,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: theme.radii.full,
    gap: 6,
  },
  chipText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  btnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    paddingHorizontal: 16,
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
    borderRadius: theme.radii.lg,
    gap: 6,
  },
  btnText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});
