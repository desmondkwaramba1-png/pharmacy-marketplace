import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { cartApi } from '../api/cart';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function AccountScreen() {
  const { user, isAuthenticated, login, register, logout, isLoading: authLoading } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const message = route.params?.message;

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['cart-history'],
    queryFn: cartApi.getHistory,
    enabled: isAuthenticated,
  });

  const handleAuth = async () => {
    setError('');
    if (!email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, firstName, lastName);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.authScroll}>
            <View style={styles.authHeader}>
              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Feather name="arrow-left" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.authForm}>
              <View style={styles.authLogo}>
                <FontAwesome5 name="plus" size={32} color="white" />
              </View>
              <Text style={styles.authTitle}>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</Text>
              
              {message && <Text style={styles.authMessage}>{message}</Text>}
              {error ? <Text style={styles.authError}>{error}</Text> : null}

              {mode === 'register' && (
                <View style={styles.formRow}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="John" />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Doe" />
                  </View>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput 
                  style={styles.input} 
                  value={email} 
                  onChangeText={setEmail} 
                  placeholder="you@example.com" 
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput 
                  style={styles.input} 
                  value={password} 
                  onChangeText={setPassword} 
                  placeholder="••••••••" 
                  secureTextEntry
                />
              </View>

              <TouchableOpacity style={styles.btnPrimary} onPress={handleAuth} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnPrimaryText}>{mode === 'login' ? 'Sign In' : 'Sign Up'}</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.switchBtn} onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
                <Text style={styles.switchText}>
                  {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Authenticated State
  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: theme.colors.primary }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: theme.layout.bottomNavHeight + 20 }}>
        
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.accent]}
          style={styles.profileHeader}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.firstName?.[0] || user?.email[0].toUpperCase()}</Text>
          </View>
          <Text style={styles.userName}>{user?.firstName ? `${user.firstName} ${user.lastName}` : 'Patient'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </LinearGradient>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Booking History</Text>
          
          {historyLoading ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : history?.items?.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Feather name="file-text" size={32} color={theme.colors.textDisabled} />
              <Text style={styles.emptyText}>No previous reservations found.</Text>
            </View>
          ) : (
            history?.items?.map((item: any) => (
              <View key={item.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyName}>{item.medicine?.genericName}</Text>
                  <Text style={styles.historyPrice}>${Number(item.price).toFixed(2)}</Text>
                </View>
                <Text style={styles.historyPharmacy}>{item.pharmacy?.name}</Text>
                <View style={styles.historyFooter}>
                  <Text style={styles.historyDate}>{new Date(item.reservedAt).toLocaleDateString()}</Text>
                  <View style={[styles.historyStatus, { backgroundColor: theme.colors.successBg }]}>
                    <Text style={{ color: theme.colors.successText, fontSize: 12, fontWeight: '600' }}>Checked Out</Text>
                  </View>
                </View>
              </View>
            ))
          )}

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Feather name="log-out" size={20} color={theme.colors.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
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
  authScroll: {
    flexGrow: 1,
  },
  authHeader: {
    padding: theme.layout.screenPadding,
  },
  backBtn: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  authForm: {
    flex: 1,
    padding: theme.layout.screenPadding,
    justifyContent: 'center',
    paddingBottom: 60,
  },
  authLogo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  authMessage: {
    color: theme.colors.warningText,
    backgroundColor: theme.colors.warningBg,
    padding: 12,
    borderRadius: theme.radii.md,
    textAlign: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  authError: {
    color: theme.colors.errorText,
    backgroundColor: theme.colors.errorBg,
    padding: 12,
    borderRadius: theme.radii.md,
    textAlign: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    paddingHorizontal: 16,
    fontSize: 15,
    backgroundColor: theme.colors.surface,
  },
  btnPrimary: {
    height: 48,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  btnPrimaryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  switchBtn: {
    padding: 16,
    alignItems: 'center',
  },
  switchText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  profileHeader: {
    padding: 40,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  content: {
    padding: theme.layout.screenPadding,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    color: theme.colors.textSecondary,
  },
  historyCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    padding: 16,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  historyPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  historyPharmacy: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  historyDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  historyStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radii.sm,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    height: 48,
    borderRadius: theme.radii.lg,
    marginTop: 24,
  },
  logoutText: {
    color: theme.colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
});
