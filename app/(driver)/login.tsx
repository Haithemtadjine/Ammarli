import React, { useState, useRef } from 'react';
import ScreenContainer from '../../components/ScreenContainer';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  TextInput,
  BackHandler
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';

const COLORS = {
  primary: '#002147',
  secondary: '#FFCC00',
  white: '#FFFFFF',
  textSecondary: '#9CA3AF',
  inputBg: '#F8FAFC',
};

const DriverLoginScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const handleLogin = async () => {
    setError('');

    if (!phone || !password) {
      setError('الرجاء إدخال جميع البيانات');
      return;
    }

    setLoading(true);
    try {
      await useAuthStore.getState().login(phone, password);
      router.replace('/(driver)/(tabs)' as any);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'كلمة المرور غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  const FormContent = (
    <View style={styles.contentWrapper}>
      {/* Top Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>AMMARLI</Text>
      </View>

      {/* Header Row */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/role-selection')}>
          <Ionicons name='chevron-forward' size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تسجيل دخول السائق</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Greeting */}
      <View style={styles.greetingSection}>
        <Text style={styles.title}>مرحباً بك مجدداً</Text>
        <Text style={styles.subtitle}>الرجاء إدخال بياناتك للمتابعة</Text>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        
        {/* Phone Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>رقم الهاتف</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="phone-portrait-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="+213 00 00 00 00"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              textAlign="right"
            />
          </View>
        </View>

        {/* Password Input */}
        <View style={[styles.inputWrapper, { marginTop: 20 }]}>
          <Text style={styles.inputLabel}>كلمة المرور</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
            <TextInput
              ref={passwordRef}
              style={styles.textInput}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textSecondary}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              textAlign="right"
            />
          </View>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity style={styles.forgotBtn}>
          <Text style={styles.forgotPassText}>نسيت كلمة المرور؟</Text>
        </TouchableOpacity>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Login Button */}
        <TouchableOpacity
          style={styles.loginButton}
          activeOpacity={0.8}
          onPress={handleLogin}
        >
          <Text style={styles.loginButtonText}>تسجيل الدخول</Text>
          <Ionicons name='arrow-forward' size={24} color={COLORS.primary} style={styles.loginArrow} />
        </TouchableOpacity>

        {/* Sign Up Link */}
        <TouchableOpacity
          style={[styles.signUpLink, { marginTop: 25 }]}
          onPress={() => router.push('/(driver)/register')}
        >
          <Text style={styles.signUpText}>
            ليس لديك حساب؟{' '}
            <Text style={styles.signUpBold}>إنشاء حساب جديد</Text>
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );

  return (
    <ScreenContainer style={[styles.container, { paddingTop: Platform.OS === 'ios' ? insets.top : 0 }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} translucent={false} />
      
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : (StatusBar.currentHeight || 24) + 20}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { flexGrow: 1, paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {FormContent}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContent: { flexGrow: 1, paddingHorizontal: 30 },
  contentWrapper: { flex: 1, minHeight: '100%', paddingVertical: 20 },

  logoContainer: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  logoText: { fontSize: 18, fontFamily: 'Cairo-Bold', color: COLORS.primary, letterSpacing: 4 },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontFamily: 'Cairo-Bold', color: COLORS.primary },

  greetingSection: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 26, fontFamily: 'Cairo-Bold', color: COLORS.primary, marginBottom: 8 },
  subtitle: { fontSize: 15, fontFamily: 'Cairo-Regular', color: COLORS.textSecondary },

  formContainer: { width: '100%' },

  inputWrapper: { width: '100%' },
  inputLabel: { fontSize: 15, fontFamily: 'Cairo-Bold', color: COLORS.primary, textAlign: 'left', marginBottom: 8 },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.inputBg,
    borderRadius: 16, 
    paddingHorizontal: 18, 
    height: 60 
  },
  textInput: { flex: 1, fontSize: 16, color: COLORS.primary, fontFamily: 'Cairo-Regular', textAlign: 'left' },
  inputIcon: { marginRight: 12 },

  forgotBtn: { alignSelf: 'flex-end', marginTop: 15 },
  forgotPassText: { fontSize: 14, fontFamily: 'Cairo-Bold', color: COLORS.primary },

  errorText: {
    color: '#EF4444',
    fontFamily: 'Cairo-Bold',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 15,
  },

  loginButton: {
    flexDirection: 'row', 
    height: 60, 
    backgroundColor: COLORS.secondary,
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 40,
    position: 'relative',
  },
  loginArrow: { position: 'absolute', left: 24 },
  loginButtonText: { fontSize: 18, fontFamily: 'Cairo-Bold', color: COLORS.primary },

  spacer: { flex: 1, minHeight: 40 },

  signUpLink: { alignItems: 'center', paddingBottom: 10 },
  signUpText: { fontSize: 15, fontFamily: 'Cairo-Regular', color: COLORS.textSecondary },
  signUpBold: { fontFamily: 'Cairo-Bold', color: COLORS.primary },
});

export default DriverLoginScreen;
