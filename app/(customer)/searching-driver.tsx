import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Animated,
  Image,
  StatusBar
} from 'react-native';
import MapView, { Marker } from '../../components/Map';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight, Droplet, Truck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useCustomerStore } from '../../src/store/useCustomerStore';

const { width } = Dimensions.get('window');

const COLORS = {
  primaryBlue: '#002147',
  accentYellow: '#FFCC00',
  white: '#FFFFFF',
  gray: '#8E8E93',
  lightGray: '#F2F2F7',
};

export default function SearchingDriverScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeOrder, userLocation, cancelOrder } = useCustomerStore();

  const handleCancel = () => {
    cancelOrder();
    router.replace('/(customer)/(tabs)');
  };

  const coordinates = activeOrder?.location || userLocation || { latitude: 35.5557, longitude: 6.1748 };
  const serviceName = activeOrder?.type === 'Bottled' ? 'مياه معبأة' : (activeOrder?.type === 'Well' ? 'مياه الآبار' : 'مياه الشرب');
  const price = activeOrder?.price || '4450';
  const locationName = activeOrder?.locationName || userLocation?.address || 'دائرة قرية جميرا، دبي';

  // Loading bar animation & Simulation Timer
  const loadingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Loading Bar Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(loadingAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.timing(loadingAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: false,
        })
      ])
    ).start();

    // 2. Simulate finding a driver after 10 seconds
    const timer = setTimeout(() => {
      // Update order status if needed, then navigate
      router.replace('/(customer)/order-tracking');
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const barTranslateX = loadingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, (width - 50) * 0.55], // Slide back and forth within the container
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" hidden={false} />
      
      {/* 1. Background Map */}
      {Platform.OS === 'web' ? (
        <Image 
          source={{ uri: 'https://placehold.co/800x800/EAECEE/002147?font=roboto&text=Map+Preview%0A(Use+Mobile+App+for+Full+Interactivity)' }}
          style={styles.map}
        />
      ) : (
        <MapView
          style={styles.map}
          initialRegion={{
            ...coordinates,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          }}
        >
          {/* Main User Marker */}
          <Marker coordinate={coordinates} title="موقعك" />

          {/* Simulated Trucks */}
          <Marker coordinate={{ latitude: coordinates.latitude + 0.004, longitude: coordinates.longitude + 0.004 }} title="شاحنة 1" iconType="truck" />
          <Marker coordinate={{ latitude: coordinates.latitude - 0.005, longitude: coordinates.longitude - 0.003 }} title="شاحنة 2" iconType="truck" />
          <Marker coordinate={{ latitude: coordinates.latitude + 0.002, longitude: coordinates.longitude - 0.006 }} title="شاحنة 3" iconType="truck" />
        </MapView>
      )}

      {/* 2. Top Bar */}
      <SafeAreaView style={[styles.topOverlay, { top: insets.top + 10 }]}>
        <View style={styles.locationBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
            <ArrowRight color={COLORS.primaryBlue} size={24} />
          </TouchableOpacity>
          <View style={styles.locationInfo}>
            <Text style={styles.locationText} numberOfLines={1}>{locationName}</Text>
            <Ionicons name="location" color={COLORS.primaryBlue} size={18} style={{marginLeft: 8}} />
          </View>
        </View>
      </SafeAreaView>

      {/* 3. Bottom Sheet */}
      <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.handle} />
        
        <View style={styles.statusRow}>
           <ActivityIndicator size="small" color={COLORS.primaryBlue} />
           <Text style={styles.statusTitle}>جاري البحث عن أقرب سائق...</Text>
        </View>

        <View style={styles.loadingBarBg}>
          <Animated.View style={[styles.loadingBarActive, { transform: [{ translateX: barTranslateX }] }]} />
        </View>

        <View style={styles.orderCard}>
          <View style={styles.priceContainer}>
             <Text style={styles.priceValue}>{price} دينار</Text>
          </View>
          <View style={styles.serviceTextContainer}>
             <Text style={styles.serviceLabel}>الخدمة المختارة:</Text>
             <Text style={styles.serviceName}>{serviceName}</Text>
          </View>
          <View style={styles.serviceIcon}>
             <Droplet color={COLORS.accentYellow} size={24} fill={COLORS.accentYellow} />
          </View>
        </View>

        <View style={styles.footerRow}>
           <Text style={styles.footerNote}>جاري البحث عن أفضل مندوب توصيل...</Text>
           <Feather name="info" size={14} color={COLORS.primaryBlue} style={{marginLeft: 6, marginBottom: 25}}/>
        </View>

        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>إلغاء الطلب</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  map: { ...StyleSheet.absoluteFillObject },
  
  topOverlay: {
    position: 'absolute',
    // top is set dynamically via inline style using insets.top
    width: '100%',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  locationBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    height: 55,
    borderRadius: 30,
    alignItems: 'center',
    paddingHorizontal: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  locationInfo: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginRight: 10 },
  locationText: { fontSize: 16, fontFamily: 'Cairo-Bold', color: COLORS.primaryBlue },
  backButton: { padding: 5 },

  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: width,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    // paddingBottom is set dynamically via inline style using insets.bottom
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    zIndex: 20,
  },
  handle: { width: 40, height: 5, backgroundColor: '#E5E5EA', borderRadius: 2.5, alignSelf: 'center', marginVertical: 15 },
  statusRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  statusTitle: { fontSize: 20, fontFamily: 'Cairo-Bold', marginRight: 15, color: COLORS.primaryBlue },
  
  loadingBarBg: { height: 4, backgroundColor: COLORS.lightGray, borderRadius: 2, marginBottom: 25, overflow: 'hidden' },
  loadingBarActive: { width: '45%', height: '100%', backgroundColor: COLORS.primaryBlue, borderRadius: 2 },

  orderCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F2F2F7',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  priceContainer: { flex: 1 },
  priceValue: { fontSize: 18, fontFamily: 'Cairo-Bold', color: COLORS.primaryBlue },
  serviceTextContainer: { alignItems: 'flex-end', marginRight: 15 },
  serviceLabel: { fontSize: 13, color: COLORS.gray, fontFamily: 'Cairo-SemiBold', marginBottom: 2 },
  serviceName: { fontSize: 16, fontFamily: 'Cairo-Bold', color: COLORS.primaryBlue },
  serviceIcon: { width: 50, height: 50, backgroundColor: COLORS.primaryBlue, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },

  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerNote: { textAlign: 'center', color: COLORS.gray, fontFamily: 'Cairo-SemiBold', fontSize: 13, marginBottom: 25 },
  cancelButton: {
    backgroundColor: COLORS.accentYellow,
    width: '100%',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.accentYellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cancelButtonText: { fontSize: 18, fontFamily: 'Cairo-Bold', color: COLORS.primaryBlue },

  userMarkerContainer: { alignItems: 'center', justifyContent: 'center' },
  userMarker: { width: 40, height: 40, backgroundColor: COLORS.primaryBlue, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: COLORS.white, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  truckIcon: { padding: 6, backgroundColor: COLORS.accentYellow, borderRadius: 8, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
});
