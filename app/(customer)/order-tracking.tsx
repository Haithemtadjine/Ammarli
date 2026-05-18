import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  Linking,
  ScrollView
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MapView, { Marker, Polyline, CachedUrlTile } from '../../components/Map';
import { useCustomerStore } from '../../src/store/useCustomerStore';
import ScreenContainer, { MIN_BOTTOM_INSET } from '../../components/ScreenContainer';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#002147', // Deep Navy Blue
  secondary: '#FFCC00', // Vibrant Yellow
  white: '#FFFFFF',
  background: '#F8F9FA',
  textSecondary: '#8E8E93',
  lightYellow: '#FFFBEA',
};

export default function OrderTrackingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userLocation } = useCustomerStore();

  const driverName = "خالد";
  const eta = "25 دقيقة";
  const phoneNumber = "+213555000000";
  const truckPlate = "سكانيا 15 ل";

  const handleCallPress = () => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleCancelOrder = () => {
    router.push('/(customer)/cancel-order');
  };

  React.useEffect(() => {
    // Simulate driver arriving after 10 seconds
    const timer = setTimeout(() => {
      router.replace('/(customer)/driver-arrived');
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const coordinates = userLocation || { latitude: 35.5557, longitude: 6.1748 };
  const driverCoordinates = { latitude: coordinates.latitude - 0.008, longitude: coordinates.longitude - 0.012 };

  return (
    // ScreenContainer يتولى الـ top inset — لا حاجة لـ marginTop في الهيدر بعد ذلك
    <ScreenContainer
      edges={['top']}
      backgroundColor={COLORS.white}
      statusBarStyle="dark-content"
      statusBarColor={COLORS.white}
    >
      
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          // paddingBottom ديناميكي: يضمن وجود مسافة آمنة فوق حافة الشاشة
          // Math.max يضمن 16dp كحد أدنى حتى لو insets.bottom = 0
          { paddingBottom: Math.max(insets.bottom, MIN_BOTTOM_INSET) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Header
             لا paddingTop هنا — ScreenContainer تولى ذلك فعلاً
             تم حذف marginTop: insets.top المُزدوج */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-forward" size={28} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>حالة الطلب</Text>
          <View style={{ width: 44 }} /> 
        </View>

        {/* ETA Badge */}
        <View style={styles.etaContainer}>
          <View style={styles.etaCard}>
            <Text style={styles.etaText}>يصل خلال {eta}</Text>
            <View style={styles.etaIconCircle}>
              <MaterialCommunityIcons name="truck-delivery" size={24} color={COLORS.primary} />
            </View>
          </View>
        </View>

        {/* Map Card */}
        <View style={styles.mapCard}>
          {Platform.OS === 'web' ? (
            <Image 
              source={{ uri: 'https://placehold.co/800x600/EAECEE/002147?font=roboto&text=Route+Map%0A(Use+Mobile+App+for+Live+Tracking)' }}
              style={styles.mapImage}
            />
          ) : (
            <MapView
              style={styles.mapImage}
              initialRegion={{
                latitude: (coordinates.latitude + driverCoordinates.latitude) / 2,
                longitude: (coordinates.longitude + driverCoordinates.longitude) / 2,
                latitudeDelta: 0.03,
                longitudeDelta: 0.03,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <CachedUrlTile
                urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maximumZ={19}
              />
              <Polyline 
                coordinates={[driverCoordinates, coordinates]}
                strokeColor="#1E88E5"
                strokeWidth={5}
              />
              
              {/* User Location */}
              <Marker coordinate={coordinates}>
                <View style={styles.userPin}>
                  <View style={styles.userPinDot} />
                </View>
              </Marker>

              {/* Driver Location */}
              <Marker coordinate={driverCoordinates}>
                <View style={styles.driverPin}>
                  <MaterialCommunityIcons name="truck-delivery" color={COLORS.white} size={16} />
                </View>
              </Marker>
            </MapView>
          )}
        </View>

        {/* Status Text */}
        <View style={styles.statusContainer}>
          <Text style={styles.mainStatusText}>مياهك في الطريق إليك!</Text>
          <Text style={styles.subStatusText}>السائق يتجه إلى موقعك الحالي</Text>
        </View>

        {/* Driver Info Card */}
        <View style={styles.driverCard}>
          <TouchableOpacity style={styles.callButton} onPress={handleCallPress}>
            <Ionicons name="call" size={22} color={COLORS.white} />
            <Text style={styles.callButtonText}>اتصال</Text>
          </TouchableOpacity>

          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{driverName}</Text>
            <View style={styles.ratingRow}>
              <Text style={styles.ratingText}>4.9</Text>
              <Ionicons name="star" size={14} color={COLORS.secondary} />
            </View>
            <Text style={styles.plateText}>رقم اللوحة: {truckPlate}</Text>
          </View>
          
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' }} 
            style={styles.driverAvatar}
          />
        </View>

        {/* Cancel Button */}
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelOrder}>
          <Text style={styles.cancelButtonText}>إلغاء الطلب</Text>
        </TouchableOpacity>

      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    // paddingBottom ديناميكي: Math.max(insets.bottom, MIN_BOTTOM_INSET) + 24
    // بدلاً من القيمة الثابتة 40 التي لا تأخذ الـ insets بعين الاعتبار
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    // تم حذف marginTop: insets.top — ScreenContainer يتولى ذلك
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Cairo-Bold',
    color: COLORS.primary,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  etaContainer: {
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  etaCard: {
    flexDirection: 'row-reverse',
    backgroundColor: COLORS.lightYellow,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#FBEB98',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  etaText: {
    fontSize: 18,
    fontFamily: 'Cairo-Bold',
    color: COLORS.primary,
    marginLeft: 15,
  },
  etaIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  mapCard: {
    marginHorizontal: 20,
    marginTop: 25,
    height: 250,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  userPin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1E88E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  userPinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },
  driverPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },

  statusContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  mainStatusText: {
    fontSize: 26,
    fontFamily: 'Cairo-Bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subStatusText: {
    fontSize: 16,
    fontFamily: 'Cairo-SemiBold',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  driverCard: {
    flexDirection: 'row-reverse',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  driverInfo: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 15,
  },
  driverName: {
    fontSize: 18,
    fontFamily: 'Cairo-Bold',
    color: COLORS.primary,
  },
  ratingRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginVertical: 4,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Cairo-Bold',
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  plateText: {
    fontSize: 13,
    fontFamily: 'Cairo-SemiBold',
    color: COLORS.textSecondary,
  },
  callButton: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#1E88E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    elevation: 3,
    shadowColor: '#1E88E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  callButtonText: {
    fontSize: 12,
    color: COLORS.white,
    fontFamily: 'Cairo-Bold',
    marginTop: 4,
  },
  cancelButton: {
    height: 56,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Cairo-Bold',
    color: '#EF4444',
  },
});
