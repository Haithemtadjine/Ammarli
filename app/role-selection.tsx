/**
 * ΓöÇΓöÇΓöÇ Role Selection Screen ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
 * Premium golden/navy design with:
 *  - LinearGradient cards (gold for customer, navy for driver)
 *  - 3D icon images via icons8
 *  - Glassmorphism image boxes
 *  - Scale animation on card selection
 *  - Haptic feedback (selection + button press)
 *  - Disabled start button until a role is chosen
 *  - router.replace() navigation (no back possible)
 */

import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/store/useAuthStore';

const { width } = Dimensions.get('window');

// ΓöÇΓöÇ Brand Tokens ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const NAVY       = '#002147';
const NAVY_DARK  = '#001530';
const GOLD       = '#D4AF37';
const GOLD_LIGHT = '#FFD700';
const WHITE      = '#FFFFFF';
const BG         = '#F8F9FA';

// ΓöÇΓöÇ Role Definition ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
type SelectedRole = 'CUSTOMER' | 'DRIVER';

interface RoleDef {
  id: SelectedRole;
  titleAr: string;
  descAr: string;
  imageUri: string;
  gradientColors: readonly [string, string, ...string[]];
  textColor: string;
  descColor: string;
  imageBoxStyle?: object;
}

const ROLES: RoleDef[] = [
  {
    id: 'CUSTOMER',
    titleAr: '╪º╪╖┘ä╪¿ ╪º┘ä╪ó┘å',
    descAr: '┘à┘è╪º┘ç ┘å┘é┘è╪⌐ ╪¬╪╡┘ä┘â ╪¿╪╢╪║╪╖╪⌐ ╪▓╪▒',
    imageUri: 'https://img.icons8.com/3d-fluency/188/water-bottle.png',
    gradientColors: ['#FFD700', '#DAA520'],
    textColor: NAVY,
    descColor: 'rgba(0,33,71,0.7)',
    imageBoxStyle: { backgroundColor: 'rgba(255,255,255,0.25)' },
  },
  {
    id: 'DRIVER',
    titleAr: '╪º┘å╪╢┘à ┘â╪┤╪▒┘è┘â',
    descAr: '┘â┘å ╪¼╪▓╪í╪º┘ï ┘à┘å ┘ü╪▒┘è┘é ╪º┘ä╪¬┘ê╪╡┘è┘ä ╪º┘ä┘à╪¡╪¬╪▒┘ü',
    imageUri: 'https://img.icons8.com/3d-fluency/188/truck.png',
    gradientColors: ['#002147', '#001530'],
    textColor: WHITE,
    descColor: 'rgba(255,255,255,0.7)',
    // Glassmorphism box for driver card
    imageBoxStyle: {
      backgroundColor: 'rgba(255,255,255,0.08)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.18)',
    },
  },
];

// ΓöÇΓöÇ Component ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export default function RoleSelectionScreen() {
  const router      = useRouter();
  const insets      = useSafeAreaInsets();
  const setUserRole = useAuthStore((s) => s.setUserRole);

  const [selectedRole, setSelectedRole] = useState<SelectedRole | null>(null);

  // One Animated.Value per card for scale feedback
  const scaleAnims = useRef(ROLES.map(() => new Animated.Value(1))).current;

  // ΓöÇΓöÇ Select a role card ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const handleSelectRole = (role: SelectedRole, index: number) => {
    Haptics.selectionAsync();
    setSelectedRole(role);

    // Pulse: slightly shrink then spring to 1.02
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.97,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[index], {
        toValue: selectedRole === role ? 1.02 : 1.02,
        friction: 5,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();

    // Reset the other card to 1
    ROLES.forEach((_, i) => {
      if (i !== index) {
        Animated.spring(scaleAnims[i], {
          toValue: 1,
          friction: 5,
          tension: 120,
          useNativeDriver: true,
        }).start();
      }
    });
  };

  // ΓöÇΓöÇ Start button ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const handleStart = () => {
    if (!selectedRole) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (selectedRole === 'CUSTOMER') {
      // Route to auth gate ΓÇö login will redirect to tabs on success
      router.push('/(customer)/login' as any);
    } else {
      // Driver: route to driver login
      router.push('/(driver)/login' as any);
    }
  };

  // ΓöÇΓöÇ Render ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const isStartEnabled = !!selectedRole;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      {/* ΓöÇΓöÇ Logo ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>Ammarli</Text>
      </View>

      {/* ΓöÇΓöÇ Title block ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      <View style={styles.textSection}>
        <Text style={styles.mainTitle}>╪Ñ╪«╪¬╪▒ ╪¬╪¼╪▒╪¿╪¬┘â</Text>
        <Text style={styles.subTitle}>┘â┘è┘ü ╪¬╪▒┘è╪» ╪º╪│╪¬╪«╪»╪º┘à ╪╣┘à╪º╪▒┘ä┘è ╪º┘ä┘è┘ê┘à╪ƒ</Text>
      </View>

      {/* ΓöÇΓöÇ Role cards ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      <View style={styles.cardsWrapper}>
        {ROLES.map((role, index) => {
          const isSelected = selectedRole === role.id;
          return (
            <Animated.View
              key={role.id}
              style={[
                styles.cardContainer,
                isSelected && styles.selectedCardBorder,
                { transform: [{ scale: scaleAnims[index] }] },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleSelectRole(role.id, index)}
              >
                <LinearGradient
                  colors={role.gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.roleCard}
                >
                  {/* row-reverse: image on the right, text on the left (RTL-friendly) */}
                  <View style={styles.cardContentRow}>

                    {/* Text ΓÇö on the left (end in LTR, start in RTL) */}
                    <View style={styles.textContent}>
                      <Text style={[styles.roleTitle, { color: role.textColor }]}>
                        {role.titleAr}
                      </Text>
                      <Text style={[styles.roleSubTitle, { color: role.descColor }]}>
                        {role.descAr}
                      </Text>
                    </View>

                    {/* Image box ΓÇö on the right (start in LTR, end in RTL) */}
                    <View style={[styles.imageBox, role.imageBoxStyle]}>
                      <Image
                        source={{ uri: role.imageUri }}
                        style={styles.threeDImage}
                        resizeMode="contain"
                      />
                    </View>

                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {/* ΓöÇΓöÇ Start button ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      <View style={styles.footer}>
        <TouchableOpacity
          disabled={!isStartEnabled}
          onPress={handleStart}
          activeOpacity={0.85}
          style={[
            styles.startButton,
            !isStartEnabled && styles.startButtonDisabled,
          ]}
        >
          <Text
            style={[
              styles.startButtonText,
              !isStartEnabled && styles.startButtonTextDisabled,
            ]}
          >
            ╪º╪¿╪»╪ú ╪º┘ä╪▒╪¡┘ä╪⌐
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ΓöÇΓöÇ Styles ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Logo
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48,
    fontFamily: 'Cairo-Bold',
    color: GOLD,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.12)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // Title
  textSection: {
    alignItems: 'center',
    marginTop: -8,
  },
  mainTitle: {
    fontSize: 32,
    fontFamily: 'Cairo-Bold',
    color: NAVY,
    textAlign: 'center',
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 15,
    fontFamily: 'Cairo-Regular',
    color: '#8E8E93',
    textAlign: 'center',
  },

  // Cards
  cardsWrapper: {
    width: '100%',
    gap: 18,
  },
  cardContainer: {
    width: '100%',
    borderRadius: 28,
    borderWidth: 2.5,
    borderColor: 'transparent',
    // Shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  selectedCardBorder: {
    borderColor: GOLD,
  },
  roleCard: {
    borderRadius: 26,
    padding: 18,
    overflow: 'hidden',
  },
  cardContentRow: {
    flexDirection: 'row-reverse',   // image on the right, text on the left (RTL-friendly)
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 100,
  },

  // Text block (inside card)
  textContent: {
    flex: 1,
    marginEnd: 12,
  },
  roleTitle: {
    fontSize: 26,
    fontFamily: 'Cairo-Bold',
    marginBottom: 4,
    textAlign: 'right',
  },
  roleSubTitle: {
    fontSize: 13,
    fontFamily: 'Cairo-Regular',
    lineHeight: 20,
    textAlign: 'right',
  },

  // Image box (glassmorphism on driver card)
  imageBox: {
    width: 90,
    height: 90,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  threeDImage: {
    width: 105,
    height: 105,
  },

  // Footer & start button
  footer: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  startButton: {
    width: '100%',
    height: 62,
    borderRadius: 31,
    backgroundColor: GOLD_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: GOLD_LIGHT,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: { elevation: 10 },
    }),
  },
  startButtonDisabled: {
    backgroundColor: '#E5E7EB',
    ...Platform.select({
      ios: { shadowColor: 'transparent', shadowOpacity: 0 },
      android: { elevation: 0 },
    }),
  },
  startButtonText: {
    fontSize: 20,
    fontFamily: 'Cairo-Bold',
    color: NAVY,
  },
  startButtonTextDisabled: {
    color: '#9CA3AF',
  },
  versionLabel: {
    fontSize: 11,
    fontFamily: 'Cairo-Regular',
    color: '#C0C4CC',
    letterSpacing: 0.3,
  },
});
