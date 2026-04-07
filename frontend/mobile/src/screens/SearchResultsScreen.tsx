import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import { medicinesApi } from '../api/medicines';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';
import MedicineCard from '../components/MedicineCard';
import { SkeletonList } from '../components/SkeletonCard';
import OfflineBanner from '../components/OfflineBanner';

export default function SearchResultsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { q = '', lat, lng } = route.params || {};
  
  const [filter, setFilter] = useState<'all' | 'in_stock'>('all');
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['search', q, lat, lng],
    queryFn: () => medicinesApi.search(q, lat, lng),
    enabled: !!q,
    staleTime: 60 * 1000,
  });

  const filteredData = data?.filter(item => filter === 'all' || item.stockStatus !== 'out_of_stock') || [];

  return (
    <SafeAreaView style={styles.container}>
      <OfflineBanner />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Results</Text>
      </View>

      <View style={styles.subheader}>
        <Text style={styles.queryText}>Results for "{q}"</Text>
        <View style={styles.filters}>
          <TouchableOpacity 
            style={[styles.pill, filter === 'all' && styles.pillActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.pillText, filter === 'all' && styles.pillTextActive]}>All Results</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.pill, filter === 'in_stock' && styles.pillActive]}
            onPress={() => setFilter('in_stock')}
          >
            <Text style={[styles.pillText, filter === 'in_stock' && styles.pillTextActive]}>In Stock</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.countText}>
          Found {filteredData.length} {filteredData.length === 1 ? 'result' : 'results'}
        </Text>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id + item.pharmacyId}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? (
            <SkeletonList count={4} />
          ) : error ? (
            <View style={styles.empty}>
              <Feather name="alert-circle" size={48} color={theme.colors.error} />
              <Text style={styles.emptyTitle}>Error loading results</Text>
              <Text style={styles.emptyText}>Please check your connection and try again.</Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <Feather name="search" size={48} color={theme.colors.textDisabled} />
              <Text style={styles.emptyTitle}>No medicines found</Text>
              <Text style={styles.emptyText}>Try adjusting your search terms or filters.</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <MedicineCard
            medicine={item}
            isAuthenticated={isAuthenticated}
            onPress={() => navigation.navigate('MedicineDetail', { id: item.id, lat, lng })}
            onAddToCart={() => addToCart(item.pharmacyId, item.id, 1)}
            onSignInToReserve={() => navigation.navigate('Account', { message: 'Sign in to reserve medicines' })}
          />
        )}
      />
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
    height: theme.layout.headerHeight,
    paddingHorizontal: 8,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: 8,
  },
  subheader: {
    padding: theme.layout.screenPadding,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  queryText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: theme.radii.full,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  pillActive: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(2,128,144,0.08)',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  pillTextActive: {
    color: theme.colors.primary,
  },
  countText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
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
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    color: theme.colors.text,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
