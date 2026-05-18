import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, StatusBar, Dimensions, Switch, Modal, Animated, ActivityIndicator, AppState } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useDriverStore } from '../../../src/store/useDriverStore';
import NewOrderCard, { ORDER_TYPES, OrderType } from '../../../components/NewOrderCard';

const { width } = Dimensions.get('window');
const COLORS = { 
  primary: '#002147', 
  secondary: '#FFCC00', 
  background: '#F8F9FA', 
  white: '#FFFFFF', 
  success: '#4ADE80', 
  warning: '#F59E0B', 
  danger: '#EF4444', 
  textSecondary: '#64748B' 
};

// مكون صندوق حالة المخزون
const StockBox = ({ label, val, status, color, bg }: any) => (
  <View style={[styles.stockBox, { backgroundColor: bg }]}>
    <Text style={[styles.boxLabel, { color }]}>{label}</Text>
    <Text style={styles.boxVal}>{val}</Text>
    <View style={[styles.statusTag, { borderColor: color }]}><Text style={[styles.statusTagText, { color }]}>{status}</Text></View>
  </View>
);

// مكون سعة الخزان (لأصحاب الصهاريج)
const TankCapacityCard = () => {
  // جلب السعة المسجلة للسائق من الستور
  const registeredDriver = useDriverStore(s => s.registeredDriver);
  const remaining = useDriverStore(s => s.inventory.tanker.remaining);
  const totalCapacity = registeredDriver?.capacity || 5000;
  
  const size = width * 0.5;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circum = radius * 2 * Math.PI;
  const progress = remaining / totalCapacity;

  const waterType = registeredDriver?.waterType || 'spring';
  
  const getWaterTypeLabel = (type: string) => {
    switch(type) {
      case 'well': return 'مياه آبار';
      case 'construction': return 'مياه بناء';
      case 'spring': default: return 'مياه ينابيع';
    }
  };

  return (
    <View style={styles.tankCard}>
      <View style={[styles.tankHeader, { justifyContent: 'space-between', width: '100%' }]}>
         <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
            <MaterialCommunityIcons name="water-percent" size={22} color={COLORS.primary} />
            <Text style={styles.tankTitle}>سعة الخزان</Text>
         </View>
         <View style={styles.waterBadge}>
            <Text style={styles.waterBadgeText}>{getWaterTypeLabel(waterType)}</Text>
         </View>
      </View>

      <View style={styles.progressContainer}>
        <Svg width={size} height={size}>
          <Circle stroke="#E2E8F0" fill="none" cx={size/2} cy={size/2} r={radius} strokeWidth={strokeWidth} />
          <Circle stroke="#3B82F6" fill="none" cx={size/2} cy={size/2} r={radius} strokeWidth={strokeWidth}
            strokeDasharray={`${circum} ${circum}`} strokeDashoffset={circum * (1 - progress)}
            strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
        </Svg>
        <View style={styles.progressTextCenter}>
           <Text style={styles.currentLitres}>{remaining}L</Text>
           <Text style={styles.totalLitres}>/ {totalCapacity}L</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.refillBtn}>
         <Text style={styles.refillText}>تعبئة الخزان</Text>
      </TouchableOpacity>
    </View>
  );
};

// جميع العلامات التجارية مع صورها
const BRAND_ASSETS: Record<string, any> = {
  'Ifri':           require('../../../assets/images/brands/ifri.png'),
  'Guedila':        require('../../../assets/images/brands/guedila.png'),
  'Saida':          require('../../../assets/images/brands/saida.png'),
  'Lalla Khedidja': require('../../../assets/images/brands/lalla-khedidja.png'),
  'Mansourah':      require('../../../assets/images/brands/mansourah.png'),
  'Toudja':         require('../../../assets/images/brands/toudja.png'),
  'Youkous':        require('../../../assets/images/brands/youkous.png'),
  'Messerghine':    require('../../../assets/images/brands/messerghine.png'),
  'Texanna':        require('../../../assets/images/brands/texanna.png'),
  'Hayat':          require('../../../assets/images/brands/hayat.jpg'),
};

// مكون قائمة الجرد (لبائعي القوارير) — يعرض فقط العلامات التي اختارها السائق
const InventoryListCard = () => {
  const registeredBrands = useDriverStore(s => s.registeredDriver?.brands ?? []);
  const [selectedBrand, setSelectedBrand] = useState(registeredBrands[0] ?? '');

  // بناء قائمة العلامات الديناميكية
  const brands = registeredBrands
    .filter(id => BRAND_ASSETS[id])
    .map(id => ({ id, name: id, logo: BRAND_ASSETS[id], count: 0 }));

  if (brands.length === 0) {
    return (
      <View style={styles.inventoryCard}>
        <Text style={[styles.inventoryTitle, { textAlign: 'center', color: COLORS.textSecondary }]}>
          لم يتم اختيار أي علامة تجارية
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.inventoryCard}>
      <View style={styles.inventoryHeader}>
         <View style={styles.badge}><Text style={styles.badgeText}>قوارير</Text></View>
         <Text style={styles.inventoryTitle}>المخزون الحالي</Text>
      </View>

      {/* التبديل بين العلامات التجارية */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandScroll}>
        {brands.map((brand) => (
          <TouchableOpacity 
            key={brand.id} 
            style={[styles.brandBtn, selectedBrand === brand.id && styles.brandBtnActive]}
            onPress={() => setSelectedBrand(brand.id)}
          >
            <View style={styles.brandCircle}>
              <Image source={brand.logo} style={{ width: 28, height: 28 }} resizeMode="contain" />
            </View>
            <Text style={styles.brandName}>{brand.name}</Text>
            <Text style={styles.brandCount}>المجموع: {brand.count}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.subTitle}>حالة المخزون</Text>
      
      {/* شبكة الحالة الملونة */}
      <View style={styles.stockGrid}>
        <StockBox label="0.5 لتر" val="25" status="ممتلئ" color={COLORS.success} bg="#F0FDF4" />
        <StockBox label="1.5 لتر" val="15" status="منخفض" color={COLORS.warning} bg="#FFFBEB" />
        <StockBox label="5 لتر" val="10" status="فارغ" color={COLORS.danger} bg="#FEF2F2" />
      </View>

      <TouchableOpacity style={styles.refillBtnInv}>
         <Ionicons name="refresh-outline" size={20} color={COLORS.white} />
         <Text style={styles.refillTextInv}>تعبئة المخزون</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function DriverDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router  = useRouter();
  const [isOnline, setIsOnline] = useState(true);
  const [showOrder, setShowOrder] = useState(false);

  // ── موقع السائق ────────────────────────────────────────────────
  const [showLocationModal,  setShowLocationModal]  = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [driverAddress,      setDriverAddress]      = useState<string | null>(null);
  const updateDriverLocation = useDriverStore(s => s.updateDriverLocation);

  // انيميشن البطاقة المنبثقة
  const slideAnim    = useRef(new Animated.Value(600)).current;
  const fadeAnim     = useRef(new Animated.Value(0)).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // يمنع إعادة إظهار الطلبية عند العودة من تطبيق خارجي (قوقل ماب...)
  const popupFired   = useRef(false);
  const appState     = useRef(AppState.currentState);

  // تتبع حالة التطبيق (foreground / background)
  useEffect(() => {
    const sub = AppState.addEventListener('change', next => {
      appState.current = next;
    });
    return () => sub.remove();
  }, []);

  // قراءة بيانات السائق من Store مباشرة
  const registeredDriver = useDriverStore(s => s.registeredDriver);
  const driverStatus     = useDriverStore(s => s.driverStatus);
  const totalEarnings    = useDriverStore(s => s.totalEarnings);
  const completedTrips   = useDriverStore(s => s.completedTrips);
  const setDriverBusy    = useDriverStore(s => s.setDriverBusy);

  const driver_name = registeredDriver?.name ?? 'السائق';
  const driver_type = registeredDriver?.driverType === 'Bottled' ? 'bottled' : 'tanker';

  // تحديد نوع الطلب المناسب لهذا السائق
  const resolveOrderType = (): OrderType => {
    if (registeredDriver?.driverType === 'Bottled') return ORDER_TYPES.BOTTLES;
    switch (registeredDriver?.waterType) {
      case 'well':         return ORDER_TYPES.WELL;
      case 'construction': return ORDER_TYPES.CONSTRUCTION;
      default:             return ORDER_TYPES.SPRING;
    }
  };

  // ── طلب صلاحية الموقع عند فتح التطبيق ───────────────────────────────
  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        setShowLocationModal(true);
      } else {
        fetchDriverLocation();
      }
    })();
  }, []);

  // ── بطاقة الطلب: تظهر فقط عندما يكون السائق "متصلاً" وغير مشغول ────────────
  useEffect(() => {
    // إذا أُغلق الاتصال أو كان مشغولاً برحلة → أخفِ البطاقة فوراً 
    if (!isOnline || driverStatus === 'BUSY') {
      popupFired.current = false;
      dismissOrder();
      return;
    }
    // لا تُعِد الإظهار إذا سبق إطلاقها (مثلاً بعد رجوع من قوقل ماب)
    if (popupFired.current) return;
    // السائق متصل والـ flag نظيفة → أظهر البطاقة بعد ثانيتين
    popupFired.current = true;
    const appear = setTimeout(() => {
      if (appState.current !== 'active') return; // لا تُظهر إذا التطبيق في الخلفية
      setShowOrder(true);
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 55, friction: 11 }),
        Animated.timing(fadeAnim,  { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start();
      dismissTimer.current = setTimeout(dismissOrder, 16000);
    }, 2000);
    return () => {
      clearTimeout(appear);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [isOnline]);

  const dismissOrder = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 600, duration: 280, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 0,   duration: 280, useNativeDriver: true }),
    ]).start(() => setShowOrder(false));
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
  };

  // ── جلب الموقع وحفظه ────────────────────────────────────────────────
  const fetchDriverLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      updateDriverLocation(loc.coords.latitude, loc.coords.longitude);
      try {
        const geo = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        if (geo.length > 0) {
          const g = geo[0];
          setDriverAddress(g.district || g.street || g.city || 'موقعك الحالي');
        }
      } catch (_) {}
    } catch (_) {}
  };

  const requestLocationPermission = async () => {
    setIsFetchingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        await fetchDriverLocation();
      }
    } catch (_) {}
    finally {
      setIsFetchingLocation(false);
      setShowLocationModal(false);
    }
  };

  // القبول: أغلق البوباب وانتقل لصفحة تفاصيل الطلبية مع تمرير البيانات
  const handleAccept = () => {
    dismissOrder();
    setDriverBusy(true); // تعيين السائق إلى "مشغول" لمنع استقبال طلبات جديدة
    const orderType = resolveOrderType();
    router.push({
      pathname: '/(driver)/order-acceptance' as any,
      params: {
        customerName: 'ياسين',
        price:        '2500',
        address:      '',
        orderType,
        distance:     '2.5 كم',
        rating:       '4.8',
      },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* ── مودال السماح بالموقع ── */}
      <Modal visible={showLocationModal} transparent animationType="fade">
        <View style={styles.locationOverlay}>
          <View style={styles.locationCard}>
            {/* أيقونة */}
            <View style={styles.locationIconWrap}>
              <Ionicons name="navigate" size={36} color={COLORS.primary} />
            </View>

            <Text style={styles.locationTitle}>تفعيل الموقع</Text>
            <Text style={styles.locationBody}>
              {'نحتاج لمعرفة موقعك الحالي لإخطارك بالطلبات القريبة منك\nولتتبع رحلاتك بدقة.'}
            </Text>

            {/* زر السماح */}
            <TouchableOpacity
              style={styles.locationAllowBtn}
              onPress={requestLocationPermission}
              activeOpacity={0.8}
              disabled={isFetchingLocation}
            >
              {isFetchingLocation ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : (
                <>
                  <Ionicons name="locate" size={18} color={COLORS.primary} style={{ marginLeft: 8 }} />
                  <Text style={styles.locationAllowText}>السماح بالوصول</Text>
                </>
              )}
            </TouchableOpacity>

            {/* زر التجاهل */}
            <TouchableOpacity
              style={styles.locationDenyBtn}
              onPress={() => setShowLocationModal(false)}
            >
              <Text style={styles.locationDenyText}>ليس الآن</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── البطاقة المنبثقة للطلب الجديد ── */}
      {showOrder && (
        <Modal transparent animationType="none" statusBarTranslucent>
          {/* خلفية شفافة */}
          <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={dismissOrder} />
          </Animated.View>

          {/* البطاقة تنبثق من الأسفل */}
          <Animated.View
            style={[
              styles.orderPopup,
              { paddingBottom: insets.bottom + 16, transform: [{ translateY: slideAnim }] },
            ]}
            pointerEvents="box-none"
          >
            <NewOrderCard
              orderType={resolveOrderType()}
              customerName="ياسين"
              price={2500}
              address=""
              distance="2.5 كم"
              rating={4.8}
              totalSeconds={15}
              onAccept={handleAccept}
              onDecline={dismissOrder}
            />
          </Animated.View>
        </Modal>
      )}
      
      {/* Header: الاسم والحالة */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/(driver)/notifications')}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
            {/* مؤشر وجود إشعارات غير مقروءة */}
            {useDriverStore(s => s.notifications.some(n => !n.isRead)) && (
              <View style={{ position: 'absolute', top: 8, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.danger }} />
            )}
          </TouchableOpacity>
          <View style={styles.toggleContainer}>
             <Text style={[styles.statusText, { color: isOnline ? COLORS.success : COLORS.textSecondary }]}>{isOnline ? 'متصل' : 'غير متصل'}</Text>
             <Switch value={isOnline} onValueChange={setIsOnline} trackColor={{ false: '#CBD5E1', true: COLORS.success }} thumbColor={COLORS.white} />
          </View>
        </View>
        <View style={styles.userSection}>
           <Text style={styles.userName}>أهلاً، {driver_name}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* ملخص اليوم (مشترك وموحد) */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: COLORS.primary }]}>
             <Text style={styles.statLabelLight}>أرباح اليوم</Text>
             <Text style={styles.statValueWhite}>{totalEarnings.toLocaleString('ar-DZ')} د.ج</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: COLORS.secondary }]}>
             <Text style={styles.statLabelDark}>الطلبات المكتملة</Text>
             <Text style={styles.statValueDark}>{completedTrips} رحلات</Text>
          </View>
        </View>

        {/* Conditional Rendering بناءً على نوع السائق */}
        {driver_type === 'tanker' ? <TankCapacityCard /> : <InventoryListCard />}
        
        {/* قسم الطلبات الجديدة المشترك */}
        <View style={styles.orderSection}>
           <Text style={styles.sectionTitle}>طلبات جديدة</Text>
           <View style={styles.emptyOrder}><Text style={styles.emptyText}>لا توجد طلبات حالياً في منطقتك</Text></View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: COLORS.white, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  notifBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  toggleContainer: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#F1F5F9', paddingHorizontal: 10, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '800' },
  userSection: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  userName: { fontSize: 22, fontWeight: '900', color: COLORS.primary },
  avatar: { width: 50, height: 50, borderRadius: 16, borderWidth: 2, borderColor: COLORS.secondary },
  statsRow: { flexDirection: 'row-reverse', gap: 15, padding: 20 },
  statCard: { flex: 1, padding: 20, borderRadius: 24, elevation: 4 },
  statLabelLight: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '700', textAlign: 'right' },
  statValueWhite: { fontSize: 22, fontWeight: '900', color: COLORS.white, textAlign: 'right', marginTop: 5 },
  statLabelDark: { fontSize: 12, color: 'rgba(0,33,71,0.6)', fontWeight: '800', textAlign: 'right' },
  statValueDark: { fontSize: 22, fontWeight: '900', color: COLORS.primary, textAlign: 'right', marginTop: 5 },
  
  // أنماط خاصة بالصهريج
  tankCard: { marginHorizontal: 20, marginBottom: 20, backgroundColor: COLORS.white, borderRadius: 32, padding: 25, alignItems: 'center', elevation: 2 },
  tankHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 25 },
  tankTitle: { fontSize: 18, fontWeight: '900', color: COLORS.primary },
  waterBadge: { backgroundColor: '#E0F2FE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  waterBadgeText: { fontSize: 12, fontWeight: '900', color: '#0284C7' },
  progressContainer: { justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  progressTextCenter: { position: 'absolute', alignItems: 'center' },
  currentLitres: { fontSize: 32, fontWeight: '900', color: COLORS.primary },
  totalLitres: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  refillBtn: { width: '100%', height: 55, borderRadius: 28, borderWidth: 2, borderColor: '#3B82F6', justifyContent: 'center', alignItems: 'center' },
  refillText: { fontSize: 16, fontWeight: '800', color: '#3B82F6' },
  
  // أنماط خاصة بالجرد والقوارير
  inventoryCard: { marginHorizontal: 20, marginBottom: 20, backgroundColor: COLORS.white, borderRadius: 32, padding: 24, elevation: 2 },
  inventoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  inventoryTitle: { fontSize: 20, fontWeight: '900', color: COLORS.primary, textAlign: 'right' },
  badge: { backgroundColor: '#E0F2FE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  badgeText: { fontSize: 10, fontWeight: '900', color: COLORS.primary },
  brandScroll: { flexDirection: 'row-reverse', gap: 12, marginBottom: 25 },
  brandBtn: { width: 105, backgroundColor: '#F8FAFC', borderRadius: 20, padding: 15, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  brandBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.white, elevation: 3 },
  brandCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', marginBottom: 10, elevation: 1 },
  brandName: { fontSize: 14, fontWeight: '900', color: COLORS.primary },
  brandCount: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '700' },
  subTitle: { fontSize: 12, fontWeight: '900', color: COLORS.textSecondary, textAlign: 'right', marginBottom: 15 },
  stockGrid: { flexDirection: 'row-reverse', gap: 10, marginBottom: 25 },
  stockBox: { flex: 1, height: 110, borderRadius: 20, alignItems: 'center', justifyContent: 'center', padding: 10 },
  boxLabel: { fontSize: 12, fontWeight: '900', marginBottom: 5 },
  boxVal: { fontSize: 24, fontWeight: '900', color: COLORS.primary },
  statusTag: { marginTop: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  statusTagText: { fontSize: 10, fontWeight: '900' },
  refillBtnInv: { height: 55, backgroundColor: COLORS.primary, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, elevation: 3 },
  refillTextInv: { fontSize: 16, fontWeight: '900', color: COLORS.white },
  
  // أنماط مشتركة أسفل الشاشة
  orderSection: { paddingHorizontal: 20, marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: COLORS.primary, textAlign: 'right', marginBottom: 15 },
  emptyOrder: { height: 100, backgroundColor: COLORS.white, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#E2E8F0' },
  emptyText: { color: COLORS.textSecondary, fontWeight: '700', fontFamily: 'Cairo-SemiBold' },

  // ── Popup order card ──────────────────────────────────────────────────────
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.50)',
  },
  orderPopup: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    backgroundColor: 'transparent',
  },

  // ── Location permission modal ────────────────────────────────────────────
  locationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationCard: {
    backgroundColor: COLORS.white,
    width: '85%',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  locationIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationTitle: {
    fontSize: 22,
    fontFamily: 'Cairo-Black',
    color: COLORS.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  locationBody: {
    fontSize: 14,
    fontFamily: 'Cairo-SemiBold',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  locationAllowBtn: {
    backgroundColor: COLORS.secondary,
    width: '100%',
    height: 54,
    borderRadius: 16,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    elevation: 4,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  locationAllowText: {
    fontFamily: 'Cairo-Black',
    fontSize: 16,
    color: COLORS.primary,
  },
  locationDenyBtn: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  locationDenyText: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 15,
    color: COLORS.textSecondary,
  },
});
