import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { theme } from '../theme';

export default function CartSheet() {
  const { cart, isCartOpen, setCartOpen, removeFromCart, checkout } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [successData, setSuccessData] = useState<{ message: string; bookingRef: string } | null>(null);

  const total = cart?.total || 0;
  const items = cart?.items || [];

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const data = await checkout();
      setSuccessData(data);
    } catch (err: any) {
      alert(err.message || 'Checkout failed');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const closeDrawer = () => {
    setCartOpen(false);
    setTimeout(() => setSuccessData(null), 300);
  };

  return (
    <Modal
      visible={isCartOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={closeDrawer}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeDrawer} />
        
        <View style={styles.sheet}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.header}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Feather name="shopping-bag" size={20} color={theme.colors.primary} />
                <Text style={styles.title}>My Reserved Medicines</Text>
              </View>
              <TouchableOpacity onPress={closeDrawer} style={styles.closeBtn}>
                <Feather name="x" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {successData ? (
              <View style={styles.successContainer}>
                <Feather name="check-circle" size={64} color={theme.colors.primary} style={{ marginBottom: 20 }} />
                <Text style={styles.successTitle}>Booking Confirmed!</Text>
                <Text style={styles.successText}>Show this reference number at the pharmacy to collect your order.</Text>
                
                <View style={styles.refBox}>
                  <Text style={styles.refLabel}>BOOKING REF</Text>
                  <Text style={styles.refCode}>{successData.bookingRef}</Text>
                </View>

                <TouchableOpacity style={styles.btnPrimary} onPress={closeDrawer}>
                  <Text style={styles.btnPrimaryText}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                  {items.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Feather name="shopping-bag" size={48} color={theme.colors.textDisabled} />
                      <Text style={styles.emptyStateTitle}>Your cart is empty</Text>
                      <Text style={styles.emptyStateText}>Medicines you add to your cart are reserved for 10 minutes to allow you to get to the pharmacy.</Text>
                    </View>
                  ) : (
                    <>
                      <View style={styles.infoBox}>
                        <Feather name="info" size={14} color={theme.colors.warningText} style={{ marginTop: 2 }} />
                        <Text style={styles.infoText}>Reserved items will automatically return to the global inventory if not checked out before the timer expires.</Text>
                      </View>

                      {items.map((item: any) => (
                        <View key={item.id} style={styles.cartItem}>
                          {item.medicine?.imageUrl && (
                            <Image source={item.medicine.imageUrl} style={styles.itemImage} />
                          )}
                          <View style={styles.itemContent}>
                            <Text style={styles.itemName}>{item.medicine?.genericName}</Text>
                            <Text style={styles.itemPharmacy}>{item.pharmacy?.name}</Text>
                            
                            <View style={styles.itemBottomRow}>
                              <View style={styles.timer}>
                                <Feather name="clock" size={12} color={item.isExpired ? theme.colors.error : theme.colors.warningText} />
                                <Text style={[styles.timerText, { color: item.isExpired ? theme.colors.error : theme.colors.warningText }]}>
                                  {item.isExpired ? 'Expired' : `${Math.floor(item.remainingSeconds / 60)}:${(item.remainingSeconds % 60).toString().padStart(2, '0')}`}
                                </Text>
                              </View>
                              
                              <View style={styles.priceRow}>
                                <Text style={styles.itemPrice}>${(item.price || 0).toFixed(2)}</Text>
                                <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                                  <Feather name="trash-2" size={18} color={theme.colors.textSecondary} />
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        </View>
                      ))}
                    </>
                  )}
                </ScrollView>

                {items.length > 0 && (
                  <View style={styles.footer}>
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Total Reservation:</Text>
                      <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
                    </View>
                    <TouchableOpacity 
                      style={[styles.btnPrimary, (isCheckingOut || items.some((i: any) => i.isExpired)) && styles.btnDisabled]} 
                      onPress={handleCheckout}
                      disabled={isCheckingOut || items.some((i: any) => i.isExpired)}
                    >
                      <Text style={styles.btnPrimaryText}>{isCheckingOut ? 'Confirming...' : 'Confirm & Book'}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    height: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.layout.screenPadding,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: theme.layout.screenPadding,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: theme.colors.warningBg,
    padding: 12,
    borderRadius: theme.radii.lg,
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.warningText,
  },
  cartItem: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: theme.radii.md,
    backgroundColor: '#f5f5f5',
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemPharmacy: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: 13,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  footer: {
    padding: theme.layout.screenPadding,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.bg,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  btnPrimary: {
    height: 48,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    backgroundColor: theme.colors.textDisabled,
  },
  btnPrimaryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  refBox: {
    backgroundColor: theme.colors.bg,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    marginBottom: 32,
    alignItems: 'center',
  },
  refLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  refCode: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
