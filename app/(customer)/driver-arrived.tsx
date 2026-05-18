import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MapView, { Marker, CachedUrlTile } from '../../components/Map';
import { useCustomerStore } from '../../src/store/useCustomerStore';

const { width } = Dimensions.get('window');

const COLORS = {
  primaryBlue: '#002147',
  accentYellow: '#FFCC00',
  white: '#FFFFFF',
  textSecondary: '#8E8E93',
  green: '#4CAF50',
  goldBorder: '#D4AF37',
};

export default function DriverArrivedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userLocation, activeOrder } = useCustomerStore();

  const handleIAmGoingOut = () => {
    // Navigate to receipt
    router.replace('/(customer)/invoice');
  };

  const coordinates = userLocation || { latitude: 35.5557, longitude: 6.1748 };
  // Driver is very close
  const driverCoordinates = { latitude: coordinates.latitude + 0.0005, longitude: coordinates.longitude + 0.0005 };

  const serviceName = activeOrder?.type === 'Bottled' ? 'مياه معبأة' : (activeOrder?.type === 'Well' ? 'مياه الآبار' : 'مياه الشرب');

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* 1. Background Map */}
      {Platform.OS === 'web' ? (
        <Image 
          source={{ uri: 'https://placehold.co/800x800/EAECEE/002147?font=roboto&text=Map+Preview%0A(Use+Mobile+App+for+3D+View)' }}
          style={styles.map}
        />
      ) : (
        <MapView
          style={styles.map}
          initialRegion={{
            ...coordinates,
            latitudeDelta: 0.003,
            longitudeDelta: 0.003,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          <CachedUrlTile
            urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
          />
          {/* User Home Marker */}
          <Marker coordinate={coordinates}>
            <View style={styles.homeMarkerContainer}>
              <View style={styles.homeMarker}>
                <Ionicons name="location" color={COLORS.primaryBlue} size={24} />
              </View>
              <View style={styles.markerShadow} />
            </View>
          </Marker>

          {/* Truck Marker (3D) */}
          <Marker coordinate={driverCoordinates}>
             <View style={styles.truckMarkerContainer}>
                <Image 
                  source={{ uri: 'https://img.icons8.com/3d-fluency/188/truck.png' }} 
                  style={styles.truckIcon3D}
                  resizeMode="contain"
                />
             </View>
          </Marker>
        </MapView>
      )}

      {/* 2. Bottom Sheet */}
      <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.handle} />
        
        {/* Green Banner */}
        <View style={styles.greenBanner}>
           <Text style={styles.bannerText}>السائق في الخارج!</Text>
           <Ionicons name="location" size={18} color={COLORS.white} style={{marginLeft: 8}} />
        </View>
        
        <Text style={styles.mainTitle}>يرجى الخروج لاستلام طلبك.</Text>

        {/* Order Card */}
        <View style={styles.infoCard}>
          <View style={styles.orderInfo}>
             <Text style={styles.orderLabel}>طلبك</Text>
             <Text style={styles.orderVolume}>{serviceName}</Text>
          </View>
          <Feather name="package" size={24} color={COLORS.primaryBlue} style={{marginLeft: 15}} />
        </View>

        {/* Driver Card */}
        <View style={styles.infoCard}>
          <TouchableOpacity style={styles.callCircle}>
            <Ionicons name="call" size={20} color={COLORS.primaryBlue} />
          </TouchableOpacity>

          <View style={styles.driverDetails}>
            <Text style={styles.driverRole}>السائق المحترف</Text>
            <Text style={styles.driverName}>خالد</Text>
            <View style={styles.ratingRow}>
               <Text style={styles.ratingCount}>(2.4k توصيل)</Text>
               <Text style={styles.ratingScore}>4.9</Text>
               <Ionicons name="star" color={COLORS.accentYellow} size={12} />
            </View>
          </View>

          <View style={styles.avatarWrapper}>
             <Image 
               source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' }} 
               style={styles.avatarImage} 
             />
             <View style={styles.onlineIndicator} />
          </View>
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handleIAmGoingOut}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>أنا خارج الآن</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  map: { ...StyleSheet.absoluteFillObject },
  
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: width,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    // paddingBottom is set dynamically via inline style using insets.bottom
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  handle: { width: 45, height: 5, backgroundColor: '#E2E8F0', borderRadius: 3, alignSelf: 'center', marginTop: 15, marginBottom: 15 },
  
  greenBanner: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 0, // Keep it within padding
    marginBottom: 20,
    borderRadius: 12,
  },
  bannerText: { color: COLORS.white, fontSize: 18, fontFamily: 'Cairo-Bold' },

  mainTitle: { fontSize: 24, fontFamily: 'Cairo-Bold', color: COLORS.primaryBlue, textAlign: 'center', marginBottom: 25 },

  infoCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1.5,
    borderColor: '#EFE2B2', // Light gold border from image
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  
  orderInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  orderLabel: { color: COLORS.primaryBlue, fontSize: 16, fontFamily: 'Cairo-Bold' },
  orderVolume: { color: COLORS.textSecondary, fontSize: 14, fontFamily: 'Cairo-SemiBold', marginTop: 2 },

  callCircle: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: '#F8F9FA', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  
  driverDetails: { flex: 1, alignItems: 'flex-end', marginRight: 15 },
  driverRole: { fontSize: 12, color: COLORS.textSecondary, fontFamily: 'Cairo-Regular', marginBottom: 2 },
  driverName: { fontSize: 18, fontFamily: 'Cairo-Bold', color: COLORS.primaryBlue },
  ratingRow: { flexDirection: 'row-reverse', alignItems: 'center', marginTop: 4 },
  ratingCount: { fontSize: 11, color: COLORS.textSecondary, fontFamily: 'Cairo-Regular', marginRight: 6 },
  ratingScore: { fontSize: 13, fontFamily: 'Cairo-Bold', color: COLORS.primaryBlue, marginLeft: 4 },

  avatarWrapper: {
    borderWidth: 3,
    borderColor: COLORS.accentYellow,
    borderRadius: 30,
    padding: 2,
  },
  avatarImage: { width: 50, height: 50, borderRadius: 25 },
  onlineIndicator: { 
    position: 'absolute', 
    bottom: 0, 
    right: 0, 
    width: 14, 
    height: 14, 
    backgroundColor: COLORS.green, 
    borderRadius: 7, 
    borderWidth: 2, 
    borderColor: COLORS.white 
  },

  primaryButton: {
    backgroundColor: COLORS.accentYellow,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 4,
    shadowColor: COLORS.accentYellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: { fontSize: 20, fontFamily: 'Cairo-Bold', color: COLORS.primaryBlue },

  homeMarkerContainer: { alignItems: 'center' },
  homeMarker: { padding: 8, backgroundColor: COLORS.accentYellow, borderRadius: 20, elevation: 5, borderWidth: 2, borderColor: COLORS.white },
  markerShadow: { width: 6, height: 4, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 2, marginTop: -2 },
  truckMarkerContainer: { width: 60, height: 60, justifyContent: 'center', alignItems: 'center' },
  truckIcon3D: { width: 70, height: 70 },
});
