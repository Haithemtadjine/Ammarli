import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AmmarliInput from '../../components/AmmarliInput';
import { useDriverStore } from '../../src/store/useDriverStore';

const COLORS = {
  primary: '#003366',
  secondary: '#F3CD0D',
  white: '#FFFFFF',
  textSecondary: '#64748B',
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

const DriverLoginScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const passwordRef = useRef<TextInput>(null);

  // قراءة الحساب المسجّل من Store
  const registeredDriver = useDriverStore(s => s.registeredDriver);

  // ── منطق تسجيل الدخول ─────────────────────────────────────────────────────
  const handleLogin = () => {
    setError('');

    // ① لا يوجد حساب مسجّل بعد
    if (!registeredDriver) {
      Alert.alert(
        'لا يوجد حساب',
        'يجب عليك إنشاء حساب أولاً قبل تسجيل الدخول.',
        [
          { text: 'إنشاء حساب', onPress: () => router.push('/(driver)/register') },
          { text: 'إلغاء', style: 'cancel' },
        ]
      );
      return;
    }

    // ② التحقق من رقم الهاتف
    if (phone.trim() !== registeredDriver.phone.trim()) {
      setError('رقم الهاتف غير صحيح');
      return;
    }

    // ③ التحقق من كلمة المرور
    if (password !== registeredDriver.password) {
      setError('كلمة المرور غير صحيحة');
      return;
    }

    // ✅ البيانات صحيحة → الانتقال للوحة التحكم
    router.replace('/(driver)/(tabs)' as any);
  };

  // ── محتوى النموذج (مشترك بين iOS و Android) ──────────────────────────────
  const FormContent = (
    <>
      {/* Illustration */}
      <View style={styles.illustrationSection}>
        <View style={styles.circleBg}>
          <Image
            source={require('../../assets/images/traker.png')}
            style={styles.truckImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>مرحباً بك مجدداً</Text>
        <Text style={styles.subtitle}>الرجاء إدخال بياناتك للمتابعة</Text>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <AmmarliInput
          label="رقم الهاتف"
          placeholder="+213 00 00 00 00"
          iconName="phone-portrait-outline"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <View style={{ marginTop: 15 }}>
          <AmmarliInput
            label="كلمة المرور"
            placeholder="••••••••"
            iconName="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            isPassword
          />
          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotPassText}>نسيت كلمة المرور؟</Text>
          </TouchableOpacity>
        </View>

        {/* رسالة الخطأ */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* زر تسجيل الدخول — يمر دائماً عبر handleLogin */}
        <TouchableOpacity
          style={styles.loginButton}
          activeOpacity={0.8}
          onPress={handleLogin}
        >
          <Text style={styles.loginButtonText}>تسجيل الدخول</Text>
          <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signUpLink}
          onPress={() => router.push('/(driver)/register')}
        >
          <Text style={styles.signUpText}>
            ليس لديك حساب؟{' '}
            <Text style={styles.signUpBold}>إنشاء حساب جديد</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'ios' ? insets.top : 0 }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} translucent={false} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-forward" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تسجيل دخول السائق</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* iOS: KeyboardAvoidingView | Android: View */}
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
          >
            {FormContent}
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          {FormContent}
        </ScrollView>
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.white },
  header:      { height: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  backButton:  { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },

  scrollContent:       { flexGrow: 1, paddingHorizontal: 30 },
  illustrationSection: { alignItems: 'center', marginTop: 10, marginBottom: 30 },
  circleBg: {
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: '#F1F5F9', justifyContent: 'center',
    alignItems: 'center', marginBottom: 20, overflow: 'hidden',
  },
  truckImage: { width: '80%', height: '80%' },
  title:      { fontSize: 28, fontWeight: '900', color: COLORS.primary, textAlign: 'center', marginBottom: 5 },
  subtitle:   { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center' },

  formContainer:  { width: '100%' },
  forgotBtn:      { alignSelf: 'flex-start', marginTop: 8 },
  forgotPassText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  errorText: {
    color: '#EF4444',
    fontFamily: 'Cairo-Bold',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: -8,
  },

  loginButton: {
    flexDirection: 'row', height: 60, backgroundColor: COLORS.secondary,
    borderRadius: 30, justifyContent: 'center', alignItems: 'center',
    marginTop: 30, gap: 10, elevation: 5,
    shadowColor: COLORS.secondary, shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3, shadowRadius: 10,
  },
  loginButtonText: { fontSize: 18, fontWeight: '900', color: COLORS.primary },

  signUpLink: { alignItems: 'center', marginTop: 25 },
  signUpText: { fontSize: 14, color: COLORS.textSecondary },
  signUpBold: { fontWeight: '900', color: COLORS.primary },
});

export default DriverLoginScreen;
