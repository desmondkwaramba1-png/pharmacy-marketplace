import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Shadows } from '../theme/shadows';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
}

const AgriGuardLogoSmall = () => (
  <Svg width={40} height={40} viewBox="0 0 100 100">
    <Path
      d="M50 5 L85 20 L85 55 C85 75 65 90 50 95 C35 90 15 75 15 55 L15 20 Z"
      fill="rgba(255,255,255,0.25)"
      stroke="rgba(255,255,255,0.6)"
      strokeWidth="2"
    />
    <Path
      d="M50 25 C50 25 30 35 30 55 C30 70 40 78 50 80 C60 78 70 70 70 55 C70 35 50 25 50 25 Z"
      fill="rgba(255,255,255,0.9)"
    />
    <Path
      d="M50 30 L50 75"
      stroke="rgba(27,94,32,0.6)"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const buttonScale = useRef(new Animated.Value(1)).current;

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.replace('Main');
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />

      {/* Header gradient */}
      <LinearGradient
        colors={[Colors.forestGreen, Colors.emerald]}
        style={styles.header}
      >
        <View style={styles.bgCircle} />
        <View style={styles.logoRow}>
          <AgriGuardLogoSmall />
          <View>
            <Text style={styles.headerBrand}>AgriGuard AI</Text>
            <Text style={styles.headerSub}>Protect. Predict. Prosper.</Text>
          </View>
        </View>
        <Text style={styles.welcomeTitle}>Welcome back</Text>
        <Text style={styles.welcomeSub}>Sign in to monitor your farm</Text>
      </LinearGradient>

      {/* Form sheet */}
      <ScrollView
        contentContainerStyle={styles.formSheet}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>

          {/* Email input */}
          <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color={emailFocused ? Colors.emerald : Colors.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email or phone number"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>

          {/* Password input */}
          <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused]}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={20}
              color={passwordFocused ? Colors.emerald : Colors.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Password"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <MaterialCommunityIcons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Forgot password */}
          <TouchableOpacity style={styles.forgotBtn} activeOpacity={0.7}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Login button */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity onPress={handleLogin} activeOpacity={0.85}>
              <LinearGradient
                colors={[Colors.emerald, Colors.forestGreen]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginButton}
              >
                {isLoading ? (
                  <View style={styles.loadingRow}>
                    <MaterialCommunityIcons name="loading" size={20} color={Colors.textWhite} />
                    <Text style={styles.loginButtonText}>Signing in...</Text>
                  </View>
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Phone login */}
          <TouchableOpacity style={styles.phoneButton} activeOpacity={0.8}>
            <MaterialCommunityIcons name="phone" size={20} color={Colors.emerald} />
            <Text style={styles.phoneButtonText}>Sign in with Phone Number</Text>
          </TouchableOpacity>

          {/* Biometric hint */}
          <TouchableOpacity style={styles.biometricBtn} activeOpacity={0.7}>
            <MaterialCommunityIcons name="fingerprint" size={28} color={Colors.textMuted} />
            <Text style={styles.biometricText}>Use Fingerprint</Text>
          </TouchableOpacity>

          {/* Register link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>New to AgriGuard? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
              <Text style={styles.registerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgCanvas,
  },
  header: {
    paddingTop: 56,
    paddingBottom: 36,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  bgCircle: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -80,
    right: -60,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  headerBrand: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textWhite,
  },
  headerSub: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.5,
  },
  welcomeTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textWhite,
  },
  welcomeSub: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  formSheet: {
    flexGrow: 1,
  },
  formContainer: {
    backgroundColor: Colors.cardBg,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 28,
    paddingTop: 32,
    minHeight: 500,
    gap: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCanvas,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    height: 54,
  },
  inputWrapperFocused: {
    borderColor: Colors.emerald,
    backgroundColor: Colors.lightMint,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    height: '100%',
  },
  eyeButton: {
    padding: 4,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  forgotText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.emerald,
  },
  loginButton: {
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginButtonText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textWhite,
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.emerald,
    height: 52,
    backgroundColor: Colors.lightMint,
  },
  phoneButtonText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.emerald,
  },
  biometricBtn: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  biometricText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textMuted,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  registerText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  registerLink: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.emerald,
  },
});
