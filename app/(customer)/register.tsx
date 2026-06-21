import ScreenContainer from '../../components/ScreenContainer';
/**
 * ─── Customer Register Screen ────────────────────────────────────────────────
 * Premium Uber-style design · Deep Navy & Vibrant Yellow
 * RTL-first · Cairo font · Full validation + Wilaya picker
 */

import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  StatusBar, Platform, KeyboardAvoidingView,
  ScrollView, ActivityIndicator, Animated, Modal, FlatList,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/useAuthStore';
import AmmarliInput from '../../components/AmmarliInput';

// ── Colors ────────────────────────────────────────────────────────────────────
const C = {
  primary:   '#003366',
  secondary: '#F3CD0D',
  white:     '#FFFFFF',
  inputBg:   '#FFFFFF',
  pageBg:    '#F8FAFC',
  muted:     '#64748B',
  border:    '#F1F5F9',
  error:     '#E53935',
  success:   '#22C55E',
};

// ── Algerian Wilayas ──────────────────────────────────────────────────────────
const WILAYAS = [
  'أدرار','الشلف','الأغواط','أم البواقي','باتنة','بجاية','بسكرة','بشار',
  'البليدة','البويرة','تمنراست','تبسة','تلمسان','تيارت','تيزي وزو','الجزائر',
  'الجلفة','جيجل','سطيف','سعيدة','سكيكدة','سيدي بلعباس','عنابة','قالمة',
  'قسنطينة','المدية','مستغانم','المسيلة','معسكر','ورقلة','وهران','البيض',
  'إليزي','برج بوعريريج','بومرداس','الطارف','تندوف','تيسمسيلت','الوادي',
  'خنشلة','سوق أهراس','تيبازة','ميلة','عين الدفلى','النعامة','عين تموشنت',
  'غرداية','غليزان','تيميمون','برج باجي مختار','أولاد جلال','بني عباس',
  'عين صالح','عين قزام','توقرت','جانت','المغير','المنيعة',
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function CustomerRegisterScreen() {
  const insets = useSafeAreaInsets();
  const router      = useRouter();
  
  const setUserRole = useAuthStore((s) => s.setUserRole);
  const setProfile  = useAuthStore((s) => s.setUserProfile);

  const [name,        setName]        = useState('');
  const [phone,       setPhone]       = useState('');
  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [wilaya,      setWilaya]      = useState('');
  const [loading,     setLoading]     = useState(false);
  const [wilayaModal, setWilayaModal] = useState(false);
  const [wilayaSearch,setWilayaSearch]= useState('');

  // Errors
  const [nameErr,    setNameErr]    = useState('');
  const [phoneErr,   setPhoneErr]   = useState('');
  const [passErr,    setPassErr]    = useState('');
  const [confirmErr, setConfirmErr] = useState('');
  const [wilayaErr,  setWilayaErr]  = useState('');

  // Refs
  const phoneRef   = useRef<TextInput>(null);
  const passRef    = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  // Shake
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,  duration: 60, useNativeDriver: true }),
    ]).start();
  };

  // Password strength
  const strength = () => {
    if (!password) return { label: '', color: 'transparent', w: '0%' };
    if (password.length < 6)  return { label: 'ضعيفة',  color: C.error,   w: '33%' };
    if (password.length < 10) return { label: 'مقبولة', color: C.secondary, w: '66%' };
    return                           { label: 'قوية',   color: C.success,  w: '100%' };
  };
  const str = strength();

  // Validation
  const validate = () => {
    let ok = true;
    setNameErr(''); setPhoneErr(''); setPassErr(''); setConfirmErr(''); setWilayaErr('');
    
    if (!name.trim()) { setNameErr('الاسم الكامل مطلوب'); ok = false; }
    
    if (!phone.trim()) { setPhoneErr('رقم الهاتف مطلوب'); ok = false; }
    else if (!/^0\d{9}$/.test(phone.trim())) { setPhoneErr('رقم هاتف صحيح (10 أرقام يبدأ بـ 0)'); ok = false; }

    if (!password) { setPassErr('كلمة المرور مطلوبة'); ok = false; }
    else if (password.length < 6) { setPassErr('6 أحرف على الأقل'); ok = false; }
    
    if (!confirm) { setConfirmErr('تأكيد كلمة المرور مطلوب'); ok = false; }
    else if (confirm !== password) { setConfirmErr('كلمتا المرور غير متطابقتين'); ok = false; }
    
    if (!wilaya) { setWilayaErr('الولاية مطلوبة'); ok = false; }
    
    if (!ok) shake();
    return ok;
  };

  // Register
  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1400));
      await setProfile({ name: name.trim(), phone: phone.trim() });
      await setUserRole('CUSTOMER');
      router.replace('/(customer)/(tabs)/' as any);
    } catch {
      setPassErr('حدث خطأ. حاول مجدداً.');
      shake();
    } finally {
      setLoading(false);
    }
  };

  const filteredWilayas = WILAYAS.filter((w) =>
    w.includes(wilayaSearch.trim())
  );

  return (
    <ScreenContainer style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top > 0 ? 0 : 12 }, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name='arrow-forward' size={24} color={C.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إنشاء حساب جديد</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView behavior="padding" style={styles.flex} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : (StatusBar.currentHeight || 24) + 20}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { flexGrow: 1, paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.mainTitle}>انضم إلينا اليوم</Text>

          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>

            {/* ── Full Name ───────────────────────────────────────────────── */}
            <AmmarliInput
              label="الاسم الكامل"
              iconName="person-outline"
              placeholder="أدخل اسمك الثلاثي"
              autoCapitalize="words"
              returnKeyType="next"
              value={name}
              error={nameErr}
              onChangeText={(t) => { setName(t); setNameErr(''); }}
              onSubmitEditing={() => phoneRef.current?.focus()}
              blurOnSubmit={false}
            />

            {/* ── Phone ───────────────────────────────────────────────────── */}
            <AmmarliInput
              ref={phoneRef}
              label="رقم الهاتف"
              iconName="call-outline"
              placeholder="0XXXXXXXXX"
              keyboardType="phone-pad"
              returnKeyType="next"
              value={phone}
              error={phoneErr}
              isValid={phone.length === 10}
              onChangeText={(t) => { setPhone(t); setPhoneErr(''); }}
              onSubmitEditing={() => passRef.current?.focus()}
              blurOnSubmit={false}
              maxLength={10}
            />

            {/* ── Password ─────────────────────────────────────────────────── */}
            <AmmarliInput
              ref={passRef}
              label="كلمة السر"
              iconName="lock-closed-outline"
              placeholder="••••••••"
              isPassword={true}
              autoCapitalize="none"
              returnKeyType="next"
              value={password}
              error={passErr}
              onChangeText={(t) => { setPassword(t); setPassErr(''); }}
              onSubmitEditing={() => confirmRef.current?.focus()}
              blurOnSubmit={false}
            />
            {password.length > 0 && (
              <View style={styles.strRow}>
                <View style={styles.strTrack}>
                  <View style={[styles.strFill, { width: str.w as any, backgroundColor: str.color }]} />
                </View>
                <Text style={[styles.strLabel, { color: str.color }]}>{str.label}</Text>
              </View>
            )}

            {/* ── Confirm Password ─────────────────────────────────────────── */}
            <AmmarliInput
              ref={confirmRef}
              label="تأكيد كلمة السر"
              iconName="lock-closed-outline"
              placeholder="••••••••"
              isPassword={true}
              autoCapitalize="none"
              returnKeyType="done"
              value={confirm}
              error={confirmErr}
              isValid={confirm.length > 0 && confirm === password}
              onChangeText={(t) => { setConfirm(t); setConfirmErr(''); }}
              onSubmitEditing={handleRegister}
            />

            {/* ── Wilaya Picker ─────────────────────────────────────────────── */}
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.label}>الولاية</Text>
              <TouchableOpacity
                style={[styles.inputBox, !!wilayaErr && styles.errBorder]}
                onPress={() => { setWilayaModal(true); setWilayaSearch(''); }}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-down" size={20} color={C.muted} style={styles.eye} />
                <Text style={[styles.input, { color: wilaya ? C.primary : '#94A3B8', paddingTop: 0 }]}>
                  {wilaya || 'اختر ولايتك'}
                </Text>
                <Ionicons name="location-outline" size={20} color={wilaya ? C.secondary : C.primary} style={styles.icon} />
              </TouchableOpacity>
              {!!wilayaErr && <Text style={styles.errText}>{wilayaErr}</Text>}
            </View>

            {/* ── Register Button ───────────────────────────────────────────── */}
            <TouchableOpacity
              style={[styles.regBtn, loading && { opacity: 0.75 }]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={C.primary} size="small" />
              ) : (
                <>
                  <Text style={styles.regText}>إنشاء حساب</Text>
                  <Ionicons name='arrow-back' size={22} color={C.primary} style={{ marginRight: 8 }} />
                </>
              )}
            </TouchableOpacity>

          </Animated.View>

          {/* ── Login Link ────────────────────────────────────────────────── */}
          <Link href="/(customer)/login" asChild>
            <TouchableOpacity style={styles.footer}>
              <Text style={styles.footerText}>
                لديك حساب بالفعل؟{' '}
                <Text style={styles.footerBold}>تسجيل الدخول</Text>
              </Text>
            </TouchableOpacity>
          </Link>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Wilaya Modal ──────────────────────────────────────────────────── */}
      <Modal visible={wilayaModal} animationType="slide" transparent onRequestClose={() => setWilayaModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setWilayaModal(false)}>
                <Ionicons name="close" size={24} color={C.primary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>اختر الولاية</Text>
              <View style={{ width: 24 }} />
            </View>

            {/* Search */}
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={18} color={C.muted} style={{ marginLeft: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="ابحث عن ولايتك..."
                placeholderTextColor="#94A3B8"
                value={wilayaSearch}
                onChangeText={setWilayaSearch}
                textAlign="right"
              />
            </View>

            {/* List */}
            <FlatList
              data={filteredWilayas}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.wilayaItem, wilaya === item && styles.wilayaSelected]}
                  onPress={() => { setWilaya(item); setWilayaErr(''); setWilayaModal(false); }}
                >
                  <Ionicons
                    name={wilaya === item ? 'checkmark-circle' : 'location-outline'}
                    size={20}
                    color={wilaya === item ? C.secondary : C.muted}
                    style={{ marginLeft: 12 }}
                  />
                  <Text style={[styles.wilayaText, wilaya === item && styles.wilayaTextSelected]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: C.border }} />}
            />
          </View>
        </View>
      </Modal>

    </ScreenContainer>
  );
}


// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: C.white },
  flex:  { flex: 1 },

  // Header
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: { fontFamily: 'Cairo-Bold', fontSize: 16, color: C.primary },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },

  // Scroll
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 32 },
  mainTitle: {
    fontFamily: 'Cairo-Bold',
    fontSize: 32,
    color: C.primary,
    textAlign: 'center',
    marginBottom: 36,
    letterSpacing: -0.5,
  },

  // Input
  label: { fontFamily: 'Cairo-Bold', fontSize: 13, color: C.primary, marginBottom: 8, textAlign: 'right', opacity: 0.85 },
  inputBox: {
    flexDirection: 'row-reverse',
    height: 64,
    backgroundColor: C.white,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  focused:       { borderColor: C.secondary },
  errBorder:     { borderColor: C.error },
  successBorder: { borderColor: C.success },
  input: {
    flex: 1,
    fontFamily: 'Cairo-Regular',
    fontSize: 16,
    color: C.primary,
    textAlign: 'right',
    paddingRight: 12,
  },
  icon: { marginLeft: 4 },
  eye:  { marginRight: 4, padding: 4 },
  errText: { fontFamily: 'Cairo-Regular', fontSize: 12, color: C.error, marginTop: 5, textAlign: 'right' },

  // Strength bar
  strRow:   { flexDirection: 'row-reverse', alignItems: 'center', marginTop: 8, gap: 8 },
  strTrack: { flex: 1, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, overflow: 'hidden' },
  strFill:  { height: '100%', borderRadius: 2 },
  strLabel: { fontFamily: 'Cairo-Regular', fontSize: 11, minWidth: 36, textAlign: 'right' },

  // Register button
  regBtn: {
    flexDirection: 'row-reverse',
    height: 64,
    backgroundColor: C.secondary,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    shadowColor: C.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  regText: { fontFamily: 'Cairo-Bold', fontSize: 18, color: C.primary },

  // Footer link
  footer:     { alignItems: 'center', marginTop: 28 },
  footerText: { fontFamily: 'Cairo-Regular', fontSize: 14, color: C.muted },
  footerBold: { fontFamily: 'Cairo-Bold', color: C.primary },

  // Wilaya Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '80%',
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  modalTitle: { fontFamily: 'Cairo-Bold', fontSize: 18, color: C.primary },
  searchBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  searchInput: { flex: 1, fontFamily: 'Cairo-Regular', fontSize: 15, color: C.primary, paddingRight: 8 },
  wilayaItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  wilayaSelected: { backgroundColor: '#FFFBEA' },
  wilayaText: { fontFamily: 'Cairo-Regular', fontSize: 16, color: C.primary, flex: 1, textAlign: 'right' },
  wilayaTextSelected: { fontFamily: 'Cairo-Bold', color: C.primary },
});
