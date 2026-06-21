import ScreenContainer from '../../components/ScreenContainer';
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useDriverStore } from '../../src/store/useDriverStore';

const { width } = Dimensions.get('window');
const PRIMARY  = '#002147';
const YELLOW   = '#F3CD0D';
const GRAY     = '#8E8E93';
const BG       = '#FAFAFA';

// ─── شرائح التقييم حسب عدد النجوم ───────────────────────────────────────────
const CHIPS_BY_RATING: Record<number, string[]> = {
  5: ['دفع بسرعة', 'متعاون جداً', 'تواصل ممتاز', 'واضح في الطلب', 'ينصح به'],
  4: ['محترم', 'تواصل جيد', 'دفع في الوقت', 'طلب واضح'],
  3: ['مقبول', 'تأخر في الرد', 'طلب غير واضح'],
  2: ['غير متعاون', 'دفع متأخر', 'تواصل سيء'],
  1: ['سيء جداً', 'لا أنصح به', 'مشكلة في الدفع', 'تجاهل التعليمات'],
};

const RATING_LABELS: Record<number, string> = {
  5: 'ممتاز!',
  4: 'جيد جداً',
  3: 'جيد',
  2: 'سيء',
  1: 'سيء جداً',
};

export default function CustomerRatingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const completeDelivery = useDriverStore(s => s.completeDelivery);

  const params = useLocalSearchParams<{ customerName: string; price: string }>();
  const customerName = params.customerName ?? 'الزبون';
  const priceValue = Number(params.price ?? 2500);

  const [rating,        setRating]        = useState(5);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [comment,       setComment]       = useState('');
  const [submitted,     setSubmitted]     = useState(false);

  const toggleChip = (chip: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedChips(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  };

  const handleStarPress = (star: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRating(star);
    setSelectedChips([]);
  };

  const finishProcess = () => {
    // إنهاء الرحلة وتسجيل الأرباح (خصم 1000 لتر كمثال ثابت للطلبية حالياً)
    completeDelivery(priceValue, 1000);
    router.replace('/(driver)/(tabs)' as any);
  };

  const handleSubmit = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitted(true);
    setTimeout(finishProcess, 1500);
  };

  const handleSkip = () => {
    finishProcess();
  };

  // ── النجوم ─────────────────────────────────────────────────────────────────
  const renderStars = () =>
    [1, 2, 3, 4, 5].map(i => (
      <TouchableOpacity key={i} onPress={() => handleStarPress(i)} activeOpacity={0.7}>
        <Ionicons
          name={i <= rating ? 'star' : 'star-outline'}
          size={48}
          color={i <= rating ? YELLOW : '#E5E5EA'}
          style={{ marginHorizontal: 6 }}
        />
      </TouchableOpacity>
    ));

  return (
    <ScreenContainer style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { flexGrow: 1, paddingTop: insets.top + 10 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── بطاقة الزبون ── */}
        <View style={styles.customerCard}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' }}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.customerName}>{customerName}</Text>
          <Text style={styles.questionText}>كيف كانت تجربتك مع هذا الزبون؟</Text>

          {/* شارة الطلبية */}
          <View style={styles.orderBadge}>
            <MaterialCommunityIcons name="check-circle" size={14} color="#22C55E" />
            <Text style={styles.orderBadgeText}>تم التوصيل بنجاح • {params.price ? `${Number(params.price).toLocaleString('ar-DZ')} د.ج` : ''}</Text>
          </View>
        </View>

        {/* ── النجوم ── */}
        <View style={styles.starsSection}>
          <View style={styles.starsRow}>{renderStars()}</View>
          <Text style={styles.ratingLabel}>{RATING_LABELS[rating]}</Text>
        </View>

        {/* ── الشرائح ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>اختر ما ينطبق</Text>
        </View>
        <View style={styles.chipsContainer}>
          {CHIPS_BY_RATING[rating].map((chip, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => toggleChip(chip)}
              style={[styles.chip, selectedChips.includes(chip) && styles.chipSelected, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
              activeOpacity={0.7}
            >
              {selectedChips.includes(chip) && (
                <Ionicons name="checkmark" size={14} color={PRIMARY} style={{ marginRight: 4 }} />
              )}
              <Text style={[styles.chipText, selectedChips.includes(chip) && styles.chipTextSelected]}>
                {chip}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── تعليق اختياري ── */}
        <View style={styles.commentSection}>
          <Text style={styles.sectionTitle}>تعليق (اختياري)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="اكتب ملاحظاتك هنا..."
            placeholderTextColor="#ADB5BD"
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
            textAlign="right"
            textAlignVertical="top"
          />
        </View>

        {/* ── رسالة النجاح ── */}
        {submitted && (
          <View style={styles.successBanner}>
            <MaterialCommunityIcons name="check-circle" size={20} color="#22C55E" />
            <Text style={styles.successText}>شكراً! تم إرسال تقييمك.</Text>
          </View>
        )}

        {/* ── أزرار ── */}
        <TouchableOpacity
          style={[styles.submitBtn, submitted && { opacity: 0.7 }]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={submitted}
        >
          <Ionicons name="checkmark-circle" size={22} color={PRIMARY} style={{ marginRight: 8 }} />
          <Text style={styles.submitText}>إرسال التقييم</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>تخطي</Text>
        </TouchableOpacity>

      </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: BG },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 50, alignItems: 'center' },

  // Customer card
  customerCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 28,
    marginBottom: 35,
    elevation: 4,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12,
  },
  avatarWrapper: {
    padding: 3, borderRadius: 50, borderWidth: 2.5, borderColor: YELLOW, marginBottom: 14,
  },
  avatar:       { width: 84, height: 84, borderRadius: 42 },
  customerName: { fontSize: 24, fontFamily: 'Cairo-Black', color: PRIMARY, marginBottom: 6 },
  questionText: { fontSize: 15, fontFamily: 'Cairo-SemiBold', color: GRAY },
  orderBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F0FDF4', paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, marginTop: 14, borderWidth: 1, borderColor: '#BBF7D0',
  },
  orderBadgeText: { fontSize: 12, fontFamily: 'Cairo-Bold', color: '#16A34A' },

  // Stars
  starsSection: { alignItems: 'center', marginBottom: 35 },
  starsRow:     { flexDirection: 'row' },
  ratingLabel:  { fontSize: 26, fontFamily: 'Cairo-Black', color: PRIMARY, marginTop: 14 },

  // Section header
  sectionHeader: { width: '100%', marginBottom: 14, alignItems: 'flex-start' },
  sectionTitle:  { fontSize: 18, fontFamily: 'Cairo-Bold', color: PRIMARY, textAlign: 'left' },

  // Chips
  chipsContainer: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'flex-start', width: '100%', marginBottom: 28,
  },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: 25, margin: 5, borderWidth: 1.5, borderColor: '#E5E5EA',
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3,
  },
  chipSelected:     { backgroundColor: YELLOW, borderColor: YELLOW },
  chipText:         { fontSize: 14, fontFamily: 'Cairo-Bold', color: GRAY },
  chipTextSelected: { color: PRIMARY },

  // Comment
  commentSection: { width: '100%', marginBottom: 32, alignItems: 'flex-start' },
  textInput: {
    backgroundColor: '#FFFFFF', borderRadius: 18, padding: 15,
    width: '100%', height: 120, fontSize: 15, fontFamily: 'Cairo-SemiBold',
    color: PRIMARY, marginTop: 12, borderWidth: 1.5, borderColor: '#E5E5EA',
  },

  // Success
  successBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F0FDF4', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#BBF7D0', width: '100%', marginBottom: 16,
  },
  successText: { fontSize: 14, fontFamily: 'Cairo-Bold', color: '#16A34A' },

  // Buttons
  submitBtn: {
    backgroundColor: YELLOW, width: '100%', height: 62, borderRadius: 31,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    elevation: 5, shadowColor: YELLOW, shadowOpacity: 0.3, shadowRadius: 10,
  },
  submitText: { fontSize: 20, fontFamily: 'Cairo-Black', color: PRIMARY, marginLeft: 8 },
  skipBtn:    { marginTop: 18, padding: 10 },
  skipText:   { fontSize: 16, fontFamily: 'Cairo-SemiBold', color: GRAY },
});
