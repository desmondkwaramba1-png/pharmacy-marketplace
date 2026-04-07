import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Keyboard } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { medicinesApi } from '../api/medicines';
import { useGeolocation } from '../hooks/useGeolocation';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { theme } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import OfflineBanner from '../components/OfflineBanner';

const RECENT_KEY = 'medifind_recent';

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>([]);
  const { coords } = useGeolocation();
  const { isAuthenticated, user } = useAuth();
  const { cart, setCartOpen } = useCart();
  const navigation = useNavigation<any>();

  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY).then(data => {
      if (data) setRecent(JSON.parse(data));
    });
  }, []);

  const saveRecent = async (q: string) => {
    const list = [q, ...recent.filter(r => r !== q)].slice(0, 5);
    setRecent(list);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(list));
  };

  const { data: popular } = useQuery({
    queryKey: ['popular-medicines', coords?.lat, coords?.lng],
    queryFn: () => medicinesApi.getPopular(coords?.lat, coords?.lng),
    staleTime: 60 * 1000,
  });

  const handleSearch = (q: string) => {
    if (!q.trim()) return;
    saveRecent(q.trim());
    Keyboard.dismiss();
    navigation.navigate('Search', { q: q.trim(), lat: coords?.lat, lng: coords?.lng });
  };

  return (
    <View style={styles.container}>
      <OfflineBanner />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: theme.layout.bottomNavHeight + 20 }}>
        
        {/* Hero Header */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.accent]}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SafeAreaView>
            <View style={styles.headerTop}>
              <Text style={styles.greeting}>🇿🇼 Zimbabwe</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity 
                  style={styles.iconBtn}
                  onPress={() => {
                    if (isAuthenticated) {
                      setCartOpen(true);
                    } else {
                      navigation.navigate('Account', { message: 'Please sign in to access your cart' });
                    }
                  }}
                >
                  <Feather name="shopping-cart" size={22} color="white" />
                  {cart && cart.itemCount > 0 && (
                    <View style={styles.cartBadge}>
                      <Text style={styles.cartBadgeText}>{cart.itemCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.iconBtn}
                  onPress={() => navigation.navigate('Account')}
                >
                  <Feather name="user" size={22} color="white" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.heroTitle}>Find Medicines Near You</Text>
            <View style={styles.locationChip}>
              <Feather name="map-pin" size={14} color="white" />
              <Text style={styles.locationText}>{coords ? 'Using your location' : 'Harare, Zimbabwe'}</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.content}>
          
          {/* Search Box */}
          <View style={styles.searchCard}>
            <View style={styles.searchBar}>
              <Feather name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for medicine..."
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={() => handleSearch(query)}
                returnKeyType="search"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
                  <Feather name="x" size={18} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
            {query.length >= 2 && (
              <TouchableOpacity style={styles.searchBtn} onPress={() => handleSearch(query)}>
                <Text style={styles.searchBtnText}>Search</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Recent Searches */}
          {recent.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                <TouchableOpacity onPress={() => { setRecent([]); AsyncStorage.removeItem(RECENT_KEY); }}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              </View>
              {recent.map(r => (
                <TouchableOpacity key={r} style={styles.recentItem} onPress={() => handleSearch(r)}>
                  <Feather name="clock" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.recentText}>{r}</Text>
                  <Feather name="chevron-right" size={18} color={theme.colors.textDisabled} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Common Medicines */}
          {popular && popular.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Common Medicines</Text>
              
              <View style={styles.popularGrid}>
                {popular.map(med => (
                  <TouchableOpacity 
                    key={med.id} 
                    style={styles.popularCard}
                    onPress={() => navigation.navigate('MedicineDetail', { id: med.id, lat: coords?.lat, lng: coords?.lng })}
                  >
                    <View style={styles.popularCardTop}>
                      {med.imageUrl ? (
                        <Image source={med.imageUrl} style={styles.popularImage} />
                      ) : (
                        <View style={styles.popularImagePlaceholder}>
                          <FontAwesome5 name="pills" size={24} color={theme.colors.primary} />
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.popularName} numberOfLines={2}>{med.medicineName || med.genericName}</Text>
                        {med.dosage && <Text style={styles.popularDosage}>{med.dosage}</Text>}
                      </View>
                    </View>

                    {med.nearestPharmacy ? (
                      <View style={styles.popularNearest}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text style={{ fontSize: 11, fontWeight: '600', color: theme.colors.primary }}>Nearest available</Text>
                          {med.distance != null && (
                            <Text style={{ fontSize: 11, color: theme.colors.textSecondary }}>
                              {med.distance < 1 ? `${Math.round(med.distance * 1000)}m` : `${med.distance.toFixed(1)}km`}
                            </Text>
                          )}
                        </View>
                        <Text style={{ fontSize: 12, fontWeight: '600' }} numberOfLines={1}>{med.nearestPharmacy.name}</Text>
                        <Text style={{ fontSize: 11, color: theme.colors.textSecondary }} numberOfLines={1}>
                          {med.nearestPharmacy.address}
                        </Text>
                        {med.price != null && (
                          <Text style={{ fontSize: 13, fontWeight: '700', marginTop: 4 }}>${med.price.toFixed(2)}</Text>
                        )}
                      </View>
                    ) : (
                      <View style={[styles.popularNearest, { backgroundColor: theme.colors.errorBg }]}>
                        <Text style={{ fontSize: 12, color: theme.colors.error }}>Currently out of stock</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
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
  hero: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.error,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primaryDark,
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 16,
  },
  locationChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radii.full,
  },
  locationText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: theme.layout.screenPadding,
  },
  searchCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: 16,
    marginTop: -24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    height: 48,
    paddingHorizontal: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: theme.colors.text,
  },
  clearBtn: {
    padding: 4,
  },
  searchBtn: {
    height: 44,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  searchBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  clearText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  recentText: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
    marginLeft: 12,
  },
  popularGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  popularCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xl,
    padding: 12,
  },
  popularCardTop: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  popularImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  popularImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(2,128,144,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  popularDosage: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  popularNearest: {
    backgroundColor: theme.colors.bg,
    padding: 10,
    borderRadius: theme.radii.lg,
  },
});
