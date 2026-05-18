import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

const COLORS = {
  primary:       '#003366',
  secondary:     '#F3CD0D',
  background:    '#F8FAFC',
  white:         '#FFFFFF',
  textSecondary: '#64748B',
  danger:        '#EF4444',
  success:       '#22C55E',
};

// ─── أيقونة لكل نوع طلبية ─────────────────────────────────────────────────────
const ORDER_META: Record<string, { icon: string; color: string; bg: string }> = {
  bottles:            { icon: 'bottle-wine-outline', color: '#16A34A', bg: '#F0FDF4' },
  well_water:         { icon: 'water-well-outline',  color: '#2563EB', bg: '#EFF6FF' },
  construction_water: { icon: 'dump-truck',          color: '#D97706', bg: '#FFF7ED' },
  spring_water:       { icon: 'water',               color: '#0284C7', bg: '#F0F9FF' },
};

export default function OrderAcceptanceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // استقبال بيانات الطلبية من بطاقة الطلب
  const params = useLocalSearchParams<{
    customerName: string;
    price:        string;
    address:      string;
    orderType:    string;
    distance:     string;
    rating:       string;
  }>();

  const customerName = params.customerName ?? 'الزبون';
  const price        = Number(params.price ?? 2500);
  const address      = params.address  ?? 'الجزائر العاصمة';
  const orderType    = params.orderType ?? 'spring_water';
  const meta         = ORDER_META[orderType] ?? ORDER_META.spring_water;
  const deliveryFee  = 150;
  const total        = price + deliveryFee;

  const [confirmed, setConfirmed] = useState(false);

  const handleCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL('tel:+213500000000');
  };

  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setConfirmed(true);
    setTimeout(() => {
      router.replace({
        pathname: '/(driver)/order-details' as any,
        params: {
          customerName: customerName,
          price:        String(price),
          address:      address,
          orderType:    orderType,
          distance:     params.distance ?? '2.5 كم',
          rating:       params.rating   ?? '4.8',
          orderNumber:  String(Math.floor(10000 + Math.random() * 90000)),
        },
      });
    }, 1200);
  };

  const handleCancel = () => {
    Alert.alert(
      'إلغاء الطلب',
      'هل أنت متأكد من إلغاء هذا الطلب؟',
      [
        { text: 'لا', style: 'cancel' },
        { text: 'نعم، إلغاء', style: 'destructive', onPress: () => router.replace('/(driver)/(tabs)' as any) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* خلفية خريطة (محاكاة) */}
      <View style={styles.mapBackground}>
        <Image
          source={{ uri: 'https://api.mapbox.com/styles/v1/mapbox/light-v10/static/3.0588,36.7538,13/600x1200?access_token=pk.placeholder' }}
          style={styles.mapImage}
          defaultSource={require('../../assets/images/icon.png')}
        />
      </View>

      {/* المحتوى العائم */}
      <View style={[styles.overlay, { paddingTop: insets.top }]}>

        {/* ── بطاقة الزبون العلوية ── */}
        <View style={styles.customerCard}>
          <View style={styles.customerRow}>
            <View style={styles.shieldIcon}>
              <Ionicons name="shield-checkmark" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.topLabel}>تم قبول طلب جديد</Text>
              <Text style={styles.customerName}>{customerName}</Text>
              <View style={styles.metaRow}>
                <Ionicons name="star" size={12} color={COLORS.secondary} />
                <Text style={styles.metaText}>{params.rating ?? '4.8'}</Text>
                <View style={styles.dot} />
                <Text style={styles.metaText}>{params.distance ?? '2.5 كم'}</Text>
              </View>
            </View>
            <View style={styles.avatarBorder}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' }}
                style={styles.avatar}
              />
            </View>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollArea}>

          {/* ── بطاقة الفاتورة ── */}
          <View style={styles.invoiceCard}>
            <View style={styles.invoiceHeader}>
              <View style={styles.orderBadge}>
                <Text style={styles.orderNum}>طلب رقم #{Math.floor(10000 + Math.random() * 90000)}</Text>
              </View>
              <View style={styles.invoiceTitleRow}>
                <Text style={styles.invoiceTitle}>الفاتورة</Text>
                <MaterialCommunityIcons name="receipt-text-outline" size={26} color="#CBD5E1" />
              </View>
            </View>

            {/* بند الطلبية الرئيسي */}
            <View style={styles.billItem}>
              <Text style={styles.itemPrice}>{price.toLocaleString('ar-DZ')} د.ج</Text>
              <View style={{ alignItems: 'flex-end', flexDirection: 'row-reverse', gap: 10 }}>
                <View style={[styles.typeIcon, { backgroundColor: meta.bg }]}>
                  <MaterialCommunityIcons name={meta.icon as any} size={18} color={meta.color} />
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.itemName}>{getOrderLabel(orderType)}</Text>
                  <Text style={styles.itemSub}>{address}</Text>
                </View>
              </View>
            </View>

            {/* رسوم التوصيل */}
            <View style={styles.billItem}>
              <Text style={styles.itemPrice}>{deliveryFee} د.ج</Text>
              <Text style={styles.itemName}>رسوم التوصيل</Text>
            </View>

            <View style={styles.dashedDivider} />

            {/* الإجمالي */}
            <View style={styles.totalRow}>
              <Text style={styles.totalAmount}>{total.toLocaleString('ar-DZ')} د.ج</Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.totalLabel}>الإجمالي</Text>
                <Text style={styles.paymentMethod}>مدفوع عبر المحفظة</Text>
              </View>
            </View>
          </View>

          {/* رسالة النجاح */}
          {confirmed && (
            <View style={styles.successBanner}>
              <MaterialCommunityIcons name="check-circle" size={22} color={COLORS.success} />
              <Text style={styles.successText}>تم تأكيد الاستلام بنجاح!</Text>
            </View>
          )}
        </ScrollView>

        {/* ── أزرار الأسفل ── */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 15 }]}>
          <TouchableOpacity style={styles.confirmBtn} activeOpacity={0.8} onPress={handleConfirm} disabled={confirmed}>
            <Text style={styles.confirmBtnText}>تأكيد الاستلام</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.callBtn} onPress={handleCall} activeOpacity={0.8}>
            <Ionicons name="call" size={20} color={COLORS.white} style={{ marginLeft: 10 }} />
            <Text style={styles.callBtnText}>اتصال بالعميل</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelText}>إلغاء الطلب</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── مساعد: اسم نوع الطلبية بالعربية ────────────────────────────────────────
function getOrderLabel(type: string): string {
  switch (type) {
    case 'bottles':            return 'مياه معدنية معبأة';
    case 'well_water':         return 'صهريج مياه آبار';
    case 'construction_water': return 'صهريج مياه أشغال';
    default:                   return 'مياه ينابيع طبيعية';
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:   { flex: 1 },
  mapBackground: { ...StyleSheet.absoluteFillObject, backgroundColor: '#E2E8F0' },
  mapImage:    { width: '100%', height: '100%', opacity: 0.45 },
  overlay:     { flex: 1 },

  // Customer card
  customerCard: {
    backgroundColor: COLORS.white, margin: 20, borderRadius: 22,
    padding: 16, elevation: 10,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15,
  },
  customerRow:  { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  customerInfo: { flex: 1, alignItems: 'flex-end', marginRight: 15 },
  topLabel:     { fontSize: 12, fontFamily: 'Cairo-Bold', color: COLORS.textSecondary },
  customerName: { fontSize: 20, fontFamily: 'Cairo-Black', color: COLORS.primary, marginTop: 2 },
  metaRow:      { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, marginTop: 4 },
  metaText:     { fontSize: 12, fontFamily: 'Cairo-Bold', color: COLORS.textSecondary },
  dot:          { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#CBD5E1' },
  avatarBorder: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: COLORS.secondary, padding: 2 },
  avatar:       { width: '100%', height: '100%', borderRadius: 28 },
  shieldIcon:   { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },

  // Scroll
  scrollArea: { paddingHorizontal: 20, paddingBottom: 20 },

  // Invoice
  invoiceCard: {
    backgroundColor: COLORS.white, borderRadius: 30, padding: 25,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15,
    marginBottom: 16,
  },
  invoiceHeader:   { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  invoiceTitleRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  invoiceTitle:    { fontSize: 26, fontFamily: 'Cairo-Black', color: COLORS.primary },
  orderBadge:      { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  orderNum:        { fontSize: 11, fontFamily: 'Cairo-Bold', color: COLORS.textSecondary },

  billItem:    { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  typeIcon:    { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  itemName:    { fontSize: 17, fontFamily: 'Cairo-Bold', color: COLORS.primary },
  itemSub:     { fontSize: 12, fontFamily: 'Cairo-SemiBold', color: COLORS.textSecondary },
  itemPrice:   { fontSize: 18, fontFamily: 'Cairo-Black', color: COLORS.primary },

  dashedDivider: { height: 1, borderBottomWidth: 1, borderStyle: 'dashed', borderColor: '#E2E8F0', marginVertical: 15 },

  totalRow:      { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel:    { fontSize: 22, fontFamily: 'Cairo-Black', color: COLORS.primary },
  totalAmount:   { fontSize: 30, fontFamily: 'Cairo-Black', color: COLORS.secondary },
  paymentMethod: { fontSize: 11, fontFamily: 'Cairo-SemiBold', color: COLORS.textSecondary },

  // Success banner
  successBanner: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 10,
    backgroundColor: '#F0FDF4', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  successText: { fontSize: 15, fontFamily: 'Cairo-Bold', color: COLORS.success },

  // Footer buttons
  footer:     { paddingHorizontal: 20, gap: 12 },
  confirmBtn: {
    height: 62, backgroundColor: COLORS.secondary, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    elevation: 5, shadowColor: COLORS.secondary, shadowOpacity: 0.3, shadowRadius: 10,
  },
  confirmBtnText: { fontSize: 19, fontFamily: 'Cairo-Black', color: COLORS.primary },
  callBtn: {
    height: 62, backgroundColor: COLORS.primary, borderRadius: 20,
    flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center', elevation: 4,
  },
  callBtnText: { fontSize: 18, fontFamily: 'Cairo-Bold', color: COLORS.white },
  cancelBtn:   { paddingVertical: 10, alignItems: 'center' },
  cancelText:  { fontSize: 14, fontFamily: 'Cairo-Bold', color: COLORS.textSecondary, opacity: 0.7 },
});
