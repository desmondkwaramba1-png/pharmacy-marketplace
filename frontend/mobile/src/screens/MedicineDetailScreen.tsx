import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Linking, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { medicinesApi } from '../api/medicines';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Badge from '../components/Badge';
import OfflineBanner from '../components/OfflineBanner';

export default function MedicineDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id, lat, lng } = route.params;

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const { data: medicine, isLoading } = useQuery({
    queryKey: ['medicine', id, lat, lng],
    queryFn: () => medicinesApi.getById(id, lat, lng),
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!medicine) return null;

  const availablePharmacies = medicine.availability.filter((a: any) => a.inStock);
  const outOfStockPharmacies = medicine.availability.filter((a: any) => !a.inStock);

  const openDirections = (pharmacy: any) => {
    const pLat = pharmacy.latitude;
    const pLng = pharmacy.longitude;
    const query = `${pharmacy.name} ${pharmacy.address} Zimbabwe`;
    
    let url = '';
    if (pLat && pLng) {
      url = Platform.select({
        ios: `maps:${pLat},${pLng}?q=${query}`,
        android: `geo:${pLat},${pLng}?q=${query}`
      }) || '';
    } else {
      url = Platform.select({
        ios: `maps:0,0?q=${query}`,
        android: `geo:0,0?q=${query}`
      }) || '';
    }
    
    if (url) Linking.openURL(url);
  };

  const callPharmacy = (phone: string) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  return (
    <View style={styles.container}>
      <OfflineBanner />
      
      {/* Header back button absolute over gradient */}
      <SafeAreaView style={styles.absHeader}>
        <TouchableOpacity style={styles.backBtnWhite} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: theme.layout.bottomNavHeight + 20 }}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.accent]}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={{ marginTop: 40, alignItems: 'center' }}>
            {medicine.imageUrl ? (
              <Image source={medicine.imageUrl} style={styles.heroImage} />
            ) : (
              <View style={styles.heroIconPlaceholder}>
                <FontAwesome5 name="pills" size={48} color="white" />
              </View>
            )}
            <Text style={styles.heroTitle}>{medicine.genericName}</Text>
            {medicine.brandName ? <Text style={styles.heroSub}>{medicine.brandName}</Text> : null}
            {medicine.dosage ? (
              <View style={styles.dosagePill}>
                <Text style={styles.dosageText}>{medicine.dosage}</Text>
              </View>
            ) : null}
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>About this Medicine</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>CATEGORY</Text>
                <Text style={styles.infoValue}>{medicine.category || 'N/A'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>FORM</Text>
                <Text style={styles.infoValue}>{medicine.form || 'N/A'}</Text>
              </View>
            </View>
            {medicine.description ? (
              <View style={styles.infoBlock}>
                <Text style={styles.infoLabel}>DESCRIPTION</Text>
                <Text style={styles.infoText}>{medicine.description}</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.sectionTitle}>Available At</Text>
          {availablePharmacies.length === 0 ? (
            <View style={[styles.infoCard, { alignItems: 'center', paddingVertical: 32 }]}>
              <FontAwesome5 name="store-alt-slash" size={32} color={theme.colors.textDisabled} />
              <Text style={{ marginTop: 12, fontSize: 15, fontWeight: '500', color: theme.colors.textSecondary }}>No pharmacies currently have this in stock.</Text>
            </View>
          ) : (
            availablePharmacies.map((avail: any) => (
              <View key={avail.pharmacyId} style={styles.availCard}>
                <View style={styles.availHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.availName}>{avail.pharmacyName}</Text>
                    <Text style={styles.availAddress}>{avail.address}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.availPrice}>${avail.price?.toFixed(2) || 'N/A'}</Text>
                    <Badge status={avail.stockStatus} />
                  </View>
                </View>

                <View style={styles.availRow}>
                  {avail.distance != null && (
                    <Text style={styles.availMeta}>
                      <FontAwesome5 name="map-marker-alt" size={10} /> {avail.distance < 1 ? `${Math.round(avail.distance * 1000)}m` : `${avail.distance.toFixed(1)}km`}
                    </Text>
                  )}
                  {avail.lastUpdated && (
                    <Text style={styles.availMeta}>
                      <Feather name="clock" size={10} /> Updated today
                    </Text>
                  )}
                </View>

                <View style={styles.availActions}>
                  {isAuthenticated ? (
                    <TouchableOpacity style={styles.btnPrimary} onPress={() => addToCart(avail.pharmacyId, medicine.id, 1)}>
                      <Feather name="shopping-cart" size={14} color="white" />
                      <Text style={styles.btnPrimaryText}>Reserve</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Account', { message: 'Sign in to reserve' })}>
                      <Feather name="log-in" size={14} color="white" />
                      <Text style={styles.btnPrimaryText}>Sign in to Reserve</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity style={styles.btnSecondary} onPress={() => openDirections(avail)}>
                    <Text style={styles.btnSecondaryText}>Directions</Text>
                  </TouchableOpacity>
                  
                  {avail.phone && (
                    <TouchableOpacity style={styles.btnSecondary} onPress={() => callPharmacy(avail.phone)}>
                      <Text style={styles.btnSecondaryText}>Call</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}

          {outOfStockPharmacies.length > 0 && (
            <View style={{ marginTop: 24 }}>
              <Text style={styles.sectionTitle}>Out of Stock</Text>
              {outOfStockPharmacies.map((avail: any) => (
                <View key={avail.pharmacyId} style={[styles.availCard, { opacity: 0.7 }]}>
                   <View style={styles.availHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.availName}>{avail.pharmacyName}</Text>
                      <Text style={styles.availAddress}>{avail.address}</Text>
                    </View>
                    <Badge status="out_of_stock" />
                  </View>
                </View>
              ))}
            </View>
          )}

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  absHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 8,
  },
  backBtnWhite: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
    margin: 8,
  },
  header: {
    height: theme.layout.headerHeight,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  backBtn: {
    padding: 8,
  },
  hero: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: 40,
    paddingBottom: 40,
  },
  heroIconPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroImage: {
    width: 96,
    height: 96,
    borderRadius: 24,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  dosagePill: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: theme.radii.full,
  },
  dosageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: theme.layout.screenPadding,
    marginTop: -24,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 12,
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
  },
  infoBlock: {
    marginTop: 16,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  availCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radii.xl,
    padding: 16,
    marginBottom: 12,
  },
  availHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  availName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  availAddress: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  availPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  availRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  availMeta: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  availActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  btnPrimary: {
    flex: 1.5,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});
