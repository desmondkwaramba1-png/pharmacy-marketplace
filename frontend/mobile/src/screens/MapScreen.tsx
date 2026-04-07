import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Dimensions, Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { pharmaciesApi } from '../api/pharmacies';
import { useGeolocation } from '../hooks/useGeolocation';
import PharmacyCard from '../components/PharmacyCard';
import { SkeletonList } from '../components/SkeletonCard';
import OfflineBanner from '../components/OfflineBanner';
import MapView, { Marker } from 'react-native-maps';
import { theme } from '../theme';

export default function MapScreen() {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string | null>(null);
  const { coords } = useGeolocation();

  const { data: pharmacies, isLoading, error } = useQuery({
    queryKey: ['pharmacies', coords?.lat, coords?.lng],
    queryFn: () => pharmaciesApi.getNearby(coords?.lat, coords?.lng),
  });

  const selectedPharmacy = pharmacies?.find(p => p.id === selectedPharmacyId);

  return (
    <SafeAreaView style={styles.container}>
      <OfflineBanner />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby Pharmacies</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]} 
            onPress={() => setViewMode('list')}
          >
            <Feather name="list" size={16} color={viewMode === 'list' ? 'white' : theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnActive]} 
            onPress={() => setViewMode('map')}
          >
            <Feather name="map" size={16} color={viewMode === 'map' ? 'white' : theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'list' || Platform.OS === 'web' ? (
        <FlatList
          data={pharmacies || []}
          keyExtractor={p => p.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            isLoading ? (
              <SkeletonList count={5} />
            ) : error ? (
              <View style={styles.empty}>
                <Feather name="alert-circle" size={48} color={theme.colors.error} />
                <Text style={styles.emptyTitle}>Error loading pharmacies</Text>
              </View>
            ) : (
              <View style={styles.empty}>
                <FontAwesome5 name="store-slash" size={48} color={theme.colors.textDisabled} />
                <Text style={styles.emptyTitle}>No pharmacies found nearby</Text>
              </View>
            )
          }
          renderItem={({ item }) => <PharmacyCard pharmacy={item} />}
        />
      ) : (
        <View style={styles.mapContainer}>
          {coords ? (
            <MapView
              showsUserLocation
              style={StyleSheet.absoluteFillObject}
              initialRegion={{
                latitude: coords.lat,
                longitude: coords.lng,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              onPress={() => setSelectedPharmacyId(null)}
            >
              {pharmacies?.map(p => {
                if (!p.latitude || !p.longitude) return null;
                return (
                  <Marker
                    key={p.id}
                    coordinate={{ latitude: p.latitude, longitude: p.longitude }}
                    onPress={(e) => {
                      e.stopPropagation();
                      setSelectedPharmacyId(p.id);
                    }}
                  >
                    <View style={[styles.marker, selectedPharmacyId === p.id && styles.markerSelected]}>
                      <FontAwesome5 name="clinic-medical" size={12} color="white" />
                    </View>
                  </Marker>
                );
              })}
            </MapView>
          ) : (
            <View style={styles.empty}>
              <Text>Waiting for location...</Text>
            </View>
          )}

          {selectedPharmacy && (
            <View style={styles.bottomSheet}>
              <View style={styles.sheetHandle} />
              <TouchableOpacity onPress={() => setSelectedPharmacyId(null)} style={styles.closeSheet}>
                <Feather name="x" size={20} color={theme.colors.text} />
              </TouchableOpacity>
              <PharmacyCard pharmacy={selectedPharmacy} onPress={() => {}} />
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.layout.screenPadding,
    height: theme.layout.headerHeight,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.bg,
    borderRadius: theme.radii.lg,
    padding: 4,
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: theme.radii.md,
  },
  toggleBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  list: {
    padding: theme.layout.screenPadding,
    paddingBottom: theme.layout.bottomNavHeight + 20,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    color: theme.colors.textDisabled,
  },
  mapContainer: {
    flex: 1,
  },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerSelected: {
    backgroundColor: theme.colors.accent,
    transform: [{ scale: 1.2 }],
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    padding: theme.layout.screenPadding,
    paddingBottom: theme.layout.screenPadding + theme.layout.bottomNavHeight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  closeSheet: {
    position: 'absolute',
    top: 12,
    right: 16,
    padding: 8,
    zIndex: 10,
  },
});
