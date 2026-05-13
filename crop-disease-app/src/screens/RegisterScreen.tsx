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
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { CropBadge } from '../components/CropBadge';
import { crops, zimbabweProvinces, districts } from '../data/mockData';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
}

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [hectares, setHectares] = useState('');
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showProvincePicker, setShowProvincePicker] = useState(false);

  const progressAnim = useRef(new Animated.Value(width * 0.33)).current;

  const goToStep = (newStep: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(newStep);
    Animated.timing(progressAnim, {
      toValue: (width - 48) * (newStep / 3),
      duration: 400,
      useNativeDriver: false,
    }).start();
  };

  const toggleCrop = (cropId: string) => {
    Haptics.selectionAsync();
    setSelectedCrops((prev) =>
      prev.includes(cropId) ? prev.filter((c) => c !== cropId) : [...prev, cropId]
    );
  };

  const handleSubmit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.replace('Main');
    }, 1800);
  };

  const availableDistricts = province ? districts[province] || [] : [];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient
        colors={[Colors.forestGreen, Colors.emerald]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <Text style={styles.headerSub}>Step {step} of 3</Text>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, { width: progressAnim }]} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <View style={styles.stepContent}>
              <View style={styles.stepHeader}>
                <View style={styles.stepIconBg}>
                  <MaterialCommunityIcons name="account" size={24} color={Colors.emerald} />
                </View>
                <View>
                  <Text style={styles.stepTitle}>Personal Information</Text>
                  <Text style={styles.stepDesc}>Tell us about yourself</Text>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="account-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Tinashe Moyo"
                    placeholderTextColor={Colors.textMuted}
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="email-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="your@email.com"
                    placeholderTextColor={Colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Phone Number</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="phone-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="+263 77 123 4567"
                    placeholderTextColor={Colors.textMuted}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <TouchableOpacity onPress={() => goToStep(2)} activeOpacity={0.85}>
                <LinearGradient colors={[Colors.emerald, Colors.forestGreen]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextButton}>
                  <Text style={styles.nextButtonText}>Next: Farm Details</Text>
                  <MaterialCommunityIcons name="arrow-right" size={20} color={Colors.textWhite} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 2: Farm Details */}
          {step === 2 && (
            <View style={styles.stepContent}>
              <View style={styles.stepHeader}>
                <View style={styles.stepIconBg}>
                  <MaterialCommunityIcons name="map-marker" size={24} color={Colors.emerald} />
                </View>
                <View>
                  <Text style={styles.stepTitle}>Farm Location</Text>
                  <Text style={styles.stepDesc}>Where is your farm located?</Text>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Province</Text>
                <TouchableOpacity
                  style={styles.inputWrapper}
                  onPress={() => setShowProvincePicker(!showProvincePicker)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="map" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <Text style={[styles.input, !province && { color: Colors.textMuted }]}>
                    {province || 'Select province...'}
                  </Text>
                  <MaterialCommunityIcons
                    name={showProvincePicker ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
                {showProvincePicker && (
                  <View style={styles.picker}>
                    <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                      {zimbabweProvinces.map((p) => (
                        <TouchableOpacity
                          key={p}
                          style={[styles.pickerItem, province === p && styles.pickerItemSelected]}
                          onPress={() => {
                            setProvince(p);
                            setDistrict('');
                            setShowProvincePicker(false);
                          }}
                        >
                          <Text style={[styles.pickerItemText, province === p && styles.pickerItemTextSelected]}>{p}</Text>
                          {province === p && <MaterialCommunityIcons name="check" size={16} color={Colors.emerald} />}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {province && (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>District</Text>
                  <View style={styles.districtGrid}>
                    {availableDistricts.slice(0, 6).map((d) => (
                      <TouchableOpacity
                        key={d}
                        style={[styles.districtChip, district === d && styles.districtChipSelected]}
                        onPress={() => setDistrict(d)}
                      >
                        <Text style={[styles.districtChipText, district === d && styles.districtChipTextSelected]}>
                          {d}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Farm Size (Hectares)</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="resize" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 5.5"
                    placeholderTextColor={Colors.textMuted}
                    value={hectares}
                    onChangeText={setHectares}
                    keyboardType="decimal-pad"
                  />
                  <Text style={styles.inputSuffix}>ha</Text>
                </View>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity onPress={() => goToStep(1)} style={styles.backButton} activeOpacity={0.7}>
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => goToStep(3)} activeOpacity={0.85} style={{ flex: 1 }}>
                  <LinearGradient colors={[Colors.emerald, Colors.forestGreen]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextButton}>
                    <Text style={styles.nextButtonText}>Next: Crops</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color={Colors.textWhite} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Step 3: Crops */}
          {step === 3 && (
            <View style={styles.stepContent}>
              <View style={styles.stepHeader}>
                <View style={styles.stepIconBg}>
                  <MaterialCommunityIcons name="leaf" size={24} color={Colors.emerald} />
                </View>
                <View>
                  <Text style={styles.stepTitle}>Your Crops</Text>
                  <Text style={styles.stepDesc}>Select all crops you grow</Text>
                </View>
              </View>

              <Text style={styles.fieldLabel}>Primary Crops (select all that apply)</Text>
              <View style={styles.cropsGrid}>
                {crops.map((crop) => (
                  <CropBadge
                    key={crop.id}
                    label={crop.label}
                    icon={crop.icon}
                    selected={selectedCrops.includes(crop.id)}
                    onPress={() => toggleCrop(crop.id)}
                  />
                ))}
              </View>

              {selectedCrops.length > 0 && (
                <View style={styles.selectionInfo}>
                  <MaterialCommunityIcons name="check-circle" size={16} color={Colors.springGreen} />
                  <Text style={styles.selectionInfoText}>
                    {selectedCrops.length} crop{selectedCrops.length > 1 ? 's' : ''} selected
                  </Text>
                </View>
              )}

              <View style={styles.benefitsCard}>
                <Text style={styles.benefitsTitle}>What you'll get:</Text>
                {[
                  'AI disease detection for your crops',
                  'Customized weather risk alerts',
                  'Crop-specific treatment advice',
                  'Financial loss projections',
                ].map((benefit, i) => (
                  <View key={i} style={styles.benefitRow}>
                    <MaterialCommunityIcons name="check" size={14} color={Colors.springGreen} />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity onPress={() => goToStep(2)} style={styles.backButton} activeOpacity={0.7}>
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSubmit} activeOpacity={0.85} style={{ flex: 1 }}>
                  <LinearGradient colors={[Colors.emerald, Colors.forestGreen]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextButton}>
                    {isLoading ? (
                      <>
                        <MaterialCommunityIcons name="loading" size={18} color={Colors.textWhite} />
                        <Text style={styles.nextButtonText}>Creating account...</Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.nextButtonText}>Create Account</Text>
                        <MaterialCommunityIcons name="rocket-launch" size={18} color={Colors.textWhite} />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={styles.loginRow}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
    paddingBottom: 28,
    paddingHorizontal: 24,
    gap: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textWhite,
  },
  headerSub: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 16,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.mint,
    borderRadius: 2,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    backgroundColor: Colors.cardBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    minHeight: 500,
  },
  stepContent: {
    padding: 24,
    gap: 20,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 4,
  },
  stepIconBg: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: Colors.lightMint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  stepDesc: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  inputSuffix: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textMuted,
  },
  picker: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginTop: 4,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  pickerItemSelected: {
    backgroundColor: Colors.lightMint,
  },
  pickerItemText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },
  pickerItemTextSelected: {
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.emerald,
  },
  districtGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  districtChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.bgCanvas,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  districtChipSelected: {
    backgroundColor: Colors.emerald,
    borderColor: Colors.forestGreen,
  },
  districtChipText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  districtChipTextSelected: {
    color: Colors.textWhite,
  },
  cropsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectionInfoText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.springGreen,
  },
  benefitsCard: {
    backgroundColor: Colors.lightMint,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  benefitsTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.emerald,
    marginBottom: 4,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  backButton: {
    paddingHorizontal: 20,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  nextButton: {
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  nextButtonText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textWhite,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.emerald,
  },
});
