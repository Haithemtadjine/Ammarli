import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useDriverStore } from '../../../src/store/useDriverStore';

const COLORS = {
  primary:       '#003366',
  secondary:     '#F3CD0D',
  background:    '#F8FAFC',
  white:         '#FFFFFF',
  textSecondary: '#64748B',
  success:       '#22C55E',
  danger:        '#EF4444',
  border:        '#F1F5F9',
};

// ─── Types ────────────────────────────────────────────────────────────────────

/** تخصص عرض الرحلة: قوارير، ينابيع، آبار، أشغال */
type TripCategory = 'bottled' | 'spring' | 'well' | 'construction';
type TripStatus   = 'مكتمل' | 'ملغي' | 'مجدول';
type Tab          = 'previous' | 'scheduled';

interface OrderItem {
  id:       string;
  category: TripCategory;   // التخصص — يُستخدم للتصفية
  title:    string;
  date:     string;
  customer: string;
  price:    string;
  status:   TripStatus;
}

// ─── Dummy Data (كل الأنواع) ──────────────────────────────────────────────────

const ALL_PREVIOUS: OrderItem[] = [
  // قوارير
  { id: 'b1', category: 'bottled',      title: '5 عبوات 1.5 لتر',       date: '23 OCT, 02:15 PM', customer: 'سارة خالد',   price: '75.00',  status: 'مكتمل' },
  { id: 'b2', category: 'bottled',      title: '10 عبوات 5 لتر',         date: '22 OCT, 09:45 AM', customer: 'يوسف علي',    price: '85.50',  status: 'مكتمل' },
  { id: 'b3', category: 'bottled',      title: '8 عبوات 1.5 لتر',        date: '20 OCT, 11:00 AM', customer: 'علي بن خالد', price: '60.00',  status: 'ملغي'  },
  // ينابيع
  { id: 's1', category: 'spring',       title: '3000 لتر مياه نبع',      date: '24 OCT, 10:30 AM', customer: 'أحمد محمد',   price: '120.00', status: 'مكتمل' },
  { id: 's2', category: 'spring',       title: '2000 لتر مياه نبع',      date: '21 OCT, 04:20 PM', customer: 'فاطمة حسن',   price: '95.00',  status: 'مكتمل' },
  // آبار
  { id: 'w1', category: 'well',         title: '4000 لتر مياه آبار',     date: '24 OCT, 08:00 AM', customer: 'كريم بلال',   price: '80.00',  status: 'مكتمل' },
  { id: 'w2', category: 'well',         title: '3500 لتر مياه آبار',     date: '22 OCT, 01:30 PM', customer: 'نادية عمر',   price: '70.00',  status: 'ملغي'  },
  // أشغال/بناء
  { id: 'c1', category: 'construction', title: '5000 لتر مياه بناء',     date: '23 OCT, 07:00 AM', customer: 'مقاولة الشمس', price: '110.00', status: 'مكتمل' },
  { id: 'c2', category: 'construction', title: '8000 لتر مياه أشغال',    date: '20 OCT, 06:00 AM', customer: 'إنجاز للبناء', price: '160.00', status: 'مكتمل' },
];

const ALL_SCHEDULED: OrderItem[] = [
  // قوارير
  { id: 'sb1', category: 'bottled',      title: '20 عبوة 5 لتر',          date: '29 OCT, 03:00 PM', customer: 'مدرسة النور',  price: '180.00', status: 'مجدول' },
  // ينابيع
  { id: 'ss1', category: 'spring',       title: '5000 لتر مياه نبع',      date: '28 OCT, 08:00 AM', customer: 'فندق الأطلس', price: '250.00', status: 'مجدول' },
  // آبار
  { id: 'sw1', category: 'well',         title: '6000 لتر مياه آبار',     date: '30 OCT, 09:00 AM', customer: 'ورشة المدينة', price: '150.00', status: 'مجدول' },
  // أشغال
  { id: 'sc1', category: 'construction', title: '10000 لتر مياه بناء',    date: '27 OCT, 06:30 AM', customer: 'شركة الأمل',  price: '300.00', status: 'مجدول' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * يُحدّد تصفية التخصص بناءً على نوع السائق ونوع المياه.
 *   Bottled              → 'bottled'
 *   Tanker + spring      → 'spring'
 *   Tanker + well        → 'well'
 *   Tanker + construction→ 'construction'
 */
function resolveCategory(
  driverType: string | undefined,
  waterType: string | undefined,
): TripCategory | null {
  if (driverType === 'Bottled') return 'bottled';
  if (driverType === 'Tanker') {
    if (waterType === 'spring')       return 'spring';
    if (waterType === 'well')         return 'well';
    if (waterType === 'construction') return 'construction';
  }
  return null; // سائق غير مسجل بعد
}

const categoryLabel: Record<TripCategory, string> = {
  bottled:      'توصيل عبوات',
  spring:       'مياه الينابيع',
  well:         'مياه الآبار',
  construction: 'مياه البناء',
};

const categoryIcon: Record<TripCategory, string> = {
  bottled:      'bottle-wine-outline',
  spring:       'water-outline',
  well:         'waves',
  construction: 'office-building-outline',
};

const statusConfig: Record<string, { bg: string; color: string }> = {
  مكتمل: { bg: '#DCFCE7', color: COLORS.success  },
  ملغي:  { bg: '#FEE2E2', color: COLORS.danger   },
  مجدول: { bg: '#DBEAFE', color: '#2563EB'       },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const OrderCard = ({ category, title, date, customer, price, status, cancelReason }: any) => {
  const badge = statusConfig[status] ?? { bg: '#F1F5F9', color: COLORS.textSecondary };
  return (
    <View style={styles.card}>
      <View style={styles.cardMain}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={categoryIcon[category as TripCategory] as any}
            size={24}
            color={COLORS.primary}
          />
        </View>
        <View style={styles.infoContainer}>
          <Text style={[styles.orderTitle, status === 'ملغي' && { color: COLORS.danger }]}>{status === 'ملغي' ? 'رحلة ملغاة' : title}</Text>
          <Text style={styles.orderDate}>{date}</Text>
          <View style={styles.customerRow}>
            <Ionicons name="person-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.customerName}>{customer}</Text>
          </View>
        </View>
      </View>

      {status === 'ملغي' && cancelReason ? (
        <View style={{ marginTop: 10, padding: 10, backgroundColor: '#FEF2F2', borderRadius: 10 }}>
          <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 13, color: COLORS.danger, textAlign: 'right' }}>السبب: {cancelReason}</Text>
        </View>
      ) : null}

      <View style={styles.cardFooter}>
        <Text style={styles.orderPrice}>{price} د.ج</Text>
        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.statusTextBadge, { color: badge.color }]}>{status}</Text>
        </View>
      </View>
    </View>
  );
};

const SpecializationBanner = ({ category }: { category: TripCategory }) => (
  <View style={styles.banner}>
    <MaterialCommunityIcons name={categoryIcon[category] as any} size={18} color={COLORS.primary} />
    <Text style={styles.bannerText}>{categoryLabel[category]}</Text>
  </View>
);

const EmptyState = ({ tab }: { tab: Tab }) => (
  <View style={styles.emptyContainer}>
    <MaterialCommunityIcons
      name={tab === 'previous' ? 'truck-check-outline' : 'calendar-clock-outline'}
      size={64}
      color="#CBD5E1"
    />
    <Text style={styles.emptyTitle}>
      {tab === 'previous' ? 'لا توجد رحلات سابقة' : 'لا توجد رحلات مجدولة'}
    </Text>
    <Text style={styles.emptySubtitle}>
      {tab === 'previous'
        ? 'ستظهر هنا رحلاتك المنجزة والملغاة'
        : 'ستظهر هنا رحلاتك القادمة المجدولة'}
    </Text>
  </View>
);

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function DriverTripsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>('previous');

  // قراءة تخصص السائق من الـ Store
  const registeredDriver = useDriverStore(s => s.registeredDriver);
  const driverType = registeredDriver?.driverType;
  const waterType  = registeredDriver?.waterType;

  const category = resolveCategory(driverType, waterType);

  // تصفية الرحلات حسب التخصص فقط
  const pool     = activeTab === 'previous' ? ALL_PREVIOUS : ALL_SCHEDULED;
  const filtered = category ? pool.filter(o => o.category === category) : [];

  const pastTripsFromStore = useDriverStore(s => s.pastTrips);
  
  let finalFiltered = filtered;
  
  if (activeTab === 'previous' && pastTripsFromStore.length > 0) {
    const mappedPastTrips = pastTripsFromStore.map(pt => ({
      id: pt.id,
      category: category || 'bottled', 
      title: pt.orderSummary,
      date: pt.time, // Using time directly or combining with date
      customer: pt.customerName,
      price: pt.amount.toFixed(2),
      status: pt.status === 'Completed' ? 'مكتمل' : 'ملغي',
      cancelReason: pt.cancelReason
    }));
    finalFiltered = [ ...mappedPastTrips, ...filtered ] as any;
  }

  // إجمالي الأرباح للرحلات المكتملة
  const totalEarned = finalFiltered
    .filter(o => o.status === 'مكتمل')
    .reduce((sum, o) => sum + parseFloat(o.price), 0);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>سجل الرحلات</Text>
        {category && <SpecializationBanner category={category} />}
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(['previous', 'scheduled'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => handleTabChange(tab)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'previous' ? 'السابقة' : 'المجدولة'}
            </Text>
            {activeTab === tab && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary Row */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryChip}>
          <Text style={styles.summaryValue}>{filtered.length}</Text>
          <Text style={styles.summaryLabel}>رحلة</Text>
        </View>
        {activeTab === 'previous' && totalEarned > 0 && (
          <View style={styles.summaryChip}>
            <Text style={styles.summaryValue}>{totalEarned.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>د.ج مكتسبة</Text>
          </View>
        )}
      </View>

      {/* List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
      >
        {finalFiltered.length === 0
          ? <EmptyState tab={activeTab} />
          : finalFiltered.map((order: any) => <OrderCard key={order.id} {...order} />)
        }
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.background },

  // Header
  header:      { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 8, alignItems: 'flex-end', gap: 6 },
  headerTitle: { fontSize: 28, fontFamily: 'Cairo-Black', color: COLORS.primary },

  // Banner
  banner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  bannerText: { fontSize: 12, fontFamily: 'Cairo-Bold', color: COLORS.primary },

  // Tabs
  tabsContainer: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginLeft: 5,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab:          {},
  activeTabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  tabText:       { fontSize: 16, fontFamily: 'Cairo-Bold',  color: COLORS.textSecondary },
  activeTabText: { color: COLORS.primary, fontFamily: 'Cairo-Black' },

  // Summary
  summaryRow: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  summaryChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  summaryValue: { fontSize: 15, fontFamily: 'Cairo-Black', color: COLORS.primary  },
  summaryLabel: { fontSize: 12, fontFamily: 'Cairo-Bold',  color: COLORS.textSecondary },

  // List
  listContent: { paddingHorizontal: 20, paddingTop: 5 },

  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
  },
  cardMain:      { flexDirection: 'row-reverse', alignItems: 'center' },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#EEF2F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  infoContainer: { flex: 1, alignItems: 'flex-end' },
  orderTitle:    { fontSize: 16, fontFamily: 'Cairo-Bold',    color: COLORS.primary      },
  orderDate:     { fontSize: 12, fontFamily: 'Cairo-Regular', color: COLORS.textSecondary, marginTop: 2 },
  customerRow:   { flexDirection: 'row-reverse', alignItems: 'center', marginTop: 7, gap: 4 },
  customerName:  { fontSize: 13, fontFamily: 'Cairo-Bold',    color: COLORS.textSecondary },

  // Card Footer
  cardFooter: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  orderPrice:      { fontSize: 18, fontFamily: 'Cairo-Black', color: COLORS.primary },
  statusBadge:     { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 10 },
  statusTextBadge: { fontSize: 12, fontFamily: 'Cairo-Bold' },

  // Empty State
  emptyContainer: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTitle:     { fontSize: 18, fontFamily: 'Cairo-Bold',    color: '#94A3B8', textAlign: 'center' },
  emptySubtitle:  { fontSize: 13, fontFamily: 'Cairo-Regular', color: '#CBD5E1', textAlign: 'center' },
});
