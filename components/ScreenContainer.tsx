/**
 * ──────────────────────────────────────────────────────────────────────────────
 * ScreenContainer — الحاوية الموحدة للمساحة الآمنة في تطبيق عمارلي
 * ──────────────────────────────────────────────────────────────────────────────
 *
 * تحل هذه الحاوية الثغرات الخمس التالية:
 *
 *  ①  تستبدل `SafeAreaView` من `react-native` الذي يعتمد على
 *     `StatusBar.currentHeight` (غير موثوق في Edge-to-Edge على Android 14+).
 *
 *  ②  تمنع الازدواجية (Double Inset) التي تحدث عند الجمع بين SafeAreaView
 *     و `paddingTop: insets.top` اليدوي في نفس الشاشة.
 *
 *  ③  تُطبّق `MIN_BOTTOM_INSET` كـ Fallback يضمن وجود 16dp حداً أدنى
 *     حتى لو أرجع النظام `insets.bottom = 0` في أول Render على بعض
 *     أجهزة Android مع `newArchEnabled: true`.
 *
 *  ④  تعمل بشكل صحيح مع Edge-to-Edge المُفعَّل تلقائياً على Android 15+.
 *
 *  ⑤  تُصدِّر ثوابت مشتركة (TAB_BAR_HEIGHT, MIN_BOTTOM_INSET) لتوحيد
 *     حسابات `paddingBottom` في جميع الـ ScrollViews عبر التطبيق.
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * الاستخدام:
 *
 *  // شاشة عادية (أعلى فقط — الأكثر شيوعاً)
 *  <ScreenContainer>...</ScreenContainer>
 *
 *  // شاشة تحتاج حماية أعلى وأسفل (بدون Footer مطلق)
 *  <ScreenContainer edges={['top', 'bottom']}>...</ScreenContainer>
 *
 *  // شاشة ذات هيدر ملوّن (مثل order-details)
 *  <ScreenContainer statusBarStyle="light-content" statusBarColor="#003366">
 *    ...
 *  </ScreenContainer>
 * ──────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── الثوابت المُصدَّرة ────────────────────────────────────────────────────────

/**
 * الحد الأدنى للمساحة الآمنة السفلية بوحدة dp.
 * يضمن عدم التصاق المحتوى بحافة الشاشة حتى لو `insets.bottom = 0`.
 * يُستخدم في Footer المطلق وفي ScrollView padding.
 */
export const MIN_BOTTOM_INSET = 16;

/**
 * الارتفاع الأساسي لشريط التبويبات (بدون insets).
 * يجب أن يتطابق مع `TAB_BASE_HEIGHT` في `(tabs)/_layout.tsx`.
 * يُستخدم لحساب `paddingBottom` في ScrollViews داخل شاشات الـ Tabs.
 */
export const TAB_BAR_HEIGHT = 60;

// ─── الأنواع ────────────────────────────────────────────────────────────────

type SafeEdge = 'top' | 'bottom' | 'left' | 'right';

interface ScreenContainerProps {
  children: React.ReactNode;
  /**
   * الحواف التي سيتم تطبيق المساحة الآمنة عليها.
   * @default ['top']
   * ملاحظة: لا تُضف 'bottom' إذا كانت الشاشة تحتوي على Footer مطلق
   * (سيتعامل الـ Footer مع الـ bottom inset بنفسه).
   */
  edges?: SafeEdge[];
  /** لون خلفية الشاشة — يُطبَّق أيضاً على منطقة Status Bar في iOS. */
  backgroundColor?: string;
  /** نمط أيقونات Status Bar. */
  statusBarStyle?: 'dark-content' | 'light-content' | 'default';
  /**
   * لون خلفية Status Bar على Android.
   * إذا لم يُحدَّد، يُستخدم backgroundColor.
   */
  statusBarColor?: string;
  /** Styles إضافية على الـ Container الرئيسي. */
  style?: StyleProp<ViewStyle>;
}

// ─── المكوّن الرئيسي ───────────────────────────────────────────────────────

export default function ScreenContainer({
  children,
  edges = ['top'],
  backgroundColor = '#FFFFFF',
  statusBarStyle = 'dark-content',
  statusBarColor,
  style,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();

  /**
   * حساب الـ padding لكل حافة:
   * - top: القيمة الحقيقية من insets (دائماً > 0 في الأجهزة الحديثة)
   * - bottom: Math.max(insets.bottom, MIN_BOTTOM_INSET) لضمان الـ Fallback
   * - left/right: القيمة المباشرة (لدعم landscape mode)
   */
  const pt = edges.includes('top')    ? insets.top                                    : 0;
  const pb = edges.includes('bottom') ? Math.max(insets.bottom, MIN_BOTTOM_INSET)     : 0;
  const pl = edges.includes('left')   ? insets.left                                   : 0;
  const pr = edges.includes('right')  ? insets.right                                  : 0;

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor,
          paddingTop:    pt,
          paddingBottom: pb,
          paddingLeft:   pl,
          paddingRight:  pr,
        },
        style,
      ]}
    >
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={statusBarColor ?? backgroundColor}
        // translucent يجب أن يكون true دائماً مع Edge-to-Edge على Android
        translucent={Platform.OS === 'android'}
      />
      {children}
    </View>
  );
}

// ─── الـ Styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
});
