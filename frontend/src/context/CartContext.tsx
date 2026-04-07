import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../api/cart';
import { CartResponse } from '../types';

interface CartContextType {
  cart: CartResponse | undefined;
  isLoading: boolean;
  addToCart: (pharmacyId: string, medicineId: string, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  checkout: (pharmacyId: string) => Promise<{ message: string; bookingRef: string; orderId: string; expiresAt: string }>;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [isCartOpen, setCartOpen] = useState(false);

  // Run cleanup once on app load to return expired reservations back to inventory
  useEffect(() => {
    cartApi.cleanupExpired().catch(console.error);
  }, []);

  // Poll the cart every 10 seconds to update 'remainingSeconds' and 'isExpired' automatically
  const { data: cart, isLoading } = useQuery({
    queryKey: ['patient-cart'],
    queryFn: cartApi.getCart,
    refetchInterval: 10000,
  });

  const addMutation = useMutation({
    mutationFn: ({ pId, mId, qty }: { pId: string; mId: string; qty: number }) => cartApi.addToCart(pId, mId, qty),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['patient-cart'], updatedCart);
      setCartOpen(true);
      // Invalidate search results to reflect the immediate drop in stock
      queryClient.invalidateQueries({ queryKey: ['search'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to add item. Maybe not enough stock?');
    }
  });

  const removeMutation = useMutation({
    mutationFn: (cartItemId: string) => cartApi.removeFromCart(cartItemId),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['patient-cart'], updatedCart);
      // Invalidate search results so stock comes back
      queryClient.invalidateQueries({ queryKey: ['search'] });
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: (pharmacyId: string) => cartApi.checkout(pharmacyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-cart'] });
      queryClient.invalidateQueries({ queryKey: ['search'] });
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
    },
  });

  const addToCart = (pId: string, mId: string, qty = 1) => addMutation.mutate({ pId, mId, qty });
  const removeFromCart = (cartItemId: string) => removeMutation.mutate(cartItemId);
  const checkout = async (pharmacyId: string) => await checkoutMutation.mutateAsync(pharmacyId);

  // Memoize context value to prevent full-app re-renders every 10s during polling
  const value = useMemo(() => ({ 
    cart, 
    isLoading, 
    addToCart, 
    removeFromCart, 
    checkout, 
    isCartOpen, 
    setCartOpen 
  }), [cart, isLoading, isCartOpen]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
