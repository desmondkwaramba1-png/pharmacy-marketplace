import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { Image } from 'expo-image';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { SearchResult } from '../types';
import { theme } from '../theme';
import Badge from './Badge';

interface Props {
  medicine: SearchResult;
  onPress: () => void;
  onAddToCart?: () => void;
  onSignInToReserve?: () => void;
  isAuthenticated: boolean;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function MedicineCard({ medicine, onPress, onAddToCart, onSignInToReserve, isAuthenticated }: Props) {
  const openDirections = () => {
    const lat = (medicine as any).nearestPharmacy?.latitude;
    const lng = (medicine as any).nearestPharmacy?.longitude;
    const query = `${medicine.pharmacyName} ${medicine.address} Zimbabwe`;
    
    let url = '';
    if (lat && lng) {
      url = Platform.select({
        ios: `maps:${lat},${lng}?q=${query}`,
        android: `geo:${lat},${lng}?q=${query}`
      }) || '';
    } else {
      url = Platform.select({
        ios: `maps:0,0?q=${query}`,
        android: `geo:0,0?q=${query}`
      }) || '';
    }
    
    Linking.openURL(url);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        {medicine.imageUrl ? (
          <Image source={medicine.imageUrl} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.iconContainer}>
            <FontAwesome5 name="pills" size={20} color={theme.colors.primary} />
          </View>
        )}
        <View style={styles.headerText}>
          <Text style={styles.name}>
            {medicine.medicineName} {medicine.dosage && <Text style={styles.dosage}>{medicine.dosage}</Text>}
          </Text>
          <Text style={styles.meta}>
            {[medicine.form, medicine.brandName, medicine.category].filter(Boolean).join(' · ')}
          </Text>
        </View>
      </View>

      <View style={styles.pharmacy}>
        <FontAwesome5 name="map-marker-alt" size={14} color={theme.colors.primary} style={{ marginTop: 2 }} />
        <View style={styles.pharmacyInfo}>
          <Text style={styles.pharmacyName}>{medicine.pharmacyName}</Text>
          <Text style={styles.pharmacyAddress}>
            {medicine.address}{medicine.suburb ? `, ${medicine.suburb}` : ''}
          </Text>

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>PRICE</Text>
              <Text style={styles.price}>
                {medicine.price != null ? `$${medicine.price.toFixed(2)}` : 'N/A'}
              </Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={{ alignItems: 'flex-end' }}>
               <Text style={styles.priceLabel}>AVAILABILITY</Text>
               <Badge status={medicine.stockStatus as any} />
            </View>
          </View>
          <Text style={styles.lastUpdated}>Updated {timeAgo(medicine.lastUpdated)}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {medicine.stockStatus !== 'out_of_stock' ? (
          isAuthenticated ? (
            <TouchableOpacity style={styles.btnPrimary} onPress={onAddToCart}>
              <Feather name="shopping-cart" size={16} color="white" />
              <Text style={styles.btnPrimaryText}>Add to Cart</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.btnPrimary} onPress={onSignInToReserve}>
              <Feather name="log-in" size={16} color="white" />
              <Text style={styles.btnPrimaryText}>Sign In to Reserve</Text>
            </TouchableOpacity>
          )
        ) : (
          <View style={styles.btnDisabled}>
            <Feather name="bell" size={16} color={theme.colors.primary} />
            <Text style={styles.btnDisabledText}>Notify Me</Text>
          </View>
        )}

        <TouchableOpacity style={styles.btnSecondary} onPress={openDirections}>
          <FontAwesome5 name="map-marker-alt" size={14} color={theme.colors.primary} />
          <Text style={styles.btnSecondaryText}>Directions</Text>
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
    marginBottom: 12,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(2,128,144,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  dosage: {
    fontSize: 13,
    fontWeight: '400',
    color: theme.colors.textSecondary,
  },
  meta: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  pharmacy: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  pharmacyInfo: {
    flex: 1,
  },
  pharmacyName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  pharmacyAddress: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.bg,
    padding: 12,
    borderRadius: theme.radii.lg,
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  priceDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },
  lastUpdated: {
    fontSize: 11,
    color: theme.colors.textDisabled,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  btnPrimary: {
    flex: 1,
    height: 40,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  btnPrimaryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  btnSecondary: {
    flex: 1,
    height: 40,
    backgroundColor: 'transparent',
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
    borderRadius: theme.radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  btnSecondaryText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  btnDisabled: {
    flex: 1,
    height: 40,
    backgroundColor: 'transparent',
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
    borderRadius: theme.radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    opacity: 0.5,
  },
  btnDisabledText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
