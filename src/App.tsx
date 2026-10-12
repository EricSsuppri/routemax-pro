import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Animated, Easing, Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function App() {
  const [activeTab, setActiveTab] = useState('Calculator');
  const [basecampVisible, setBasecampVisible] = useState(false);

  // Smooth driving animation setup
  const drivingAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startDriving = () => {
      drivingAnimation.setValue(0);
      Animated.timing(drivingAnimation, {
        toValue: 1,
        duration: 25000, // Very slow and relaxing driving speed
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => startDriving());
    };
    startDriving();
  }, [drivingAnimation]);

  const translateY = drivingAnimation.interpolate({
    inputRange:,
    outputRange: [-SCREEN_HEIGHT, 0],
  });

  return (
    <View style={styles.container}>
      {/* 🛣️ LIVE ANIMATED DRIVING ROAD BACKGROUND */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.Image
          source={require('./road-bg.jpg')}
          style={[styles.roadLayer, { transform: [{ translateY }] }]}
          resizeMode="cover"
        />
        <Animated.Image
          source={require('./road-bg.jpg')}
          style={[
            styles.roadLayer,
            { transform: [{ translateY: Animated.add(translateY, SCREEN_HEIGHT) }] },
          ]}
          resizeMode="cover"
        />
        <View style={styles.darkDarkOverlay} />
      </View>

      {/* FOREGROUND APPLICATION LAYOUT */}
      <ScrollView style={styles.foregroundContent}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.menuIcon}>≡</Text>
            <View>
              <Text style={styles.logoText}>RouteMax Pro</Text>
              <Text style={styles.subLogoText}>True Profit Calculator</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.helpIcon}>?</Text>
            {/* Basecamp view toggle icon at the top right */}
            <TouchableOpacity onPress={() => setBasecampVisible(!basecampVisible)} style={styles.profileCircle}>
              <Text style={{ fontSize: 16 }}>⛺</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Top Tabs */}
        <View style={styles.tabContainer}>
          {['Calculator', 'Compare', 'Reports', 'Tax', 'Accepted'].map((tab) => (
            <TouchableOpacity 
              key={tab} 
              onPress={() => setActiveTab(tab)}
              style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab content logic */}
        {activeTab === 'Calculator' && (
          <View style={styles.paddedContent}>
            <Text style={styles.heroText}>Know your real earnings before every trip.</Text>
            <Text style={styles.subHeroText}>Fuel, wear & time — factored in automatically.</Text>
            
            <View style={styles.timelineContainer}>
              <View style={styles.timelineLine} />
              <View style={styles.timelineNodeActive} />
            </View>

            {/* Ask Eric Card (Pure Gold Theme, No Teal/Purple Highlights) */}
            <View style={styles.ericCard}>
              <View style={styles.ericIconContainer}>
                <Text style={styles.ericStar}>✨</Text>
              </View>
              <View style={styles.ericTextContainer}>
                <Text style={styles.ericTitle}>Ask Eric anything</Text>
                <Text style={styles.ericSubTitle}>Which offer should I take? How's my we...</Text>
              </View>
              <Text style={styles.arrowRight}>&gt;</Text>
            </View>

            <Text style={styles.sectionHeader}>QUICK PRESETS <Text style={styles.versionText}>• v2.259</Text></Text>
            <View style={styles.presetRow}>
              <View style={[styles.presetItem, styles.activePreset]}>
                <Text style={styles.presetIcon}>🚲</Text>
                <Text style={styles.presetLabel}>DoorDash</Text>
              </View>
              <View style={styles.presetItem}>
                <Text style={styles.presetIcon}>📦</Text>
                <Text style={styles.presetLabel}>Amazon I</Text>
              </View>
              <View style={styles.addPresetButton}>
                <Text style={styles.addPresetText}>+</Text>
              </View>
            </View>

            <View style={styles.vehicleCard}>
              <Text style={styles.vehicleIcon}>🚗</Text>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleTitle}>Toyota Camry 2007–2...</Text>
                <Text style={styles.vehicleDetails}>Gas • 25 mph</Text>
              </View>
              <Text style={styles.arrowRight}>&gt;</Text>
            </View>
          </View>
        )}

        {/* Reports panel with Export Buttons permanently removed */}
        {activeTab === 'Reports' && (
          <View style={styles.paddedContent}>
            <Text style={styles.heroText}>Performance Reports</Text>
            <Text style={styles.subHeroText}>Detailed summary of your true margins and shift allocations.</Text>
            
            <View style={styles.metricsContainer}>
              <Text style={styles.metricLabel}>Total Profit</Text>
              <Text style={styles.metricValue}>$1,245.50</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ⛺ BASECAMP BOTTOM SHEET MODAL VIEW (Teal removed, matching the main dashboard) */}
      {basecampVisible && (
        <View style={styles.basecampSheet}>
          <View style={styles.dragHandle} />
          
          <Text style={styles.basecampTitle}>Basecamp</Text>
          <Text style={styles.basecampDescription}>
            Your base for every journey. Track hydration, time your breaks, log expenses, scan meals for fuel value, check route weather, and ask the coach anything — here for you before, during, and after every trip.
          </Text>

          {/* Live Weather Card with soft gold accent lines */}
          <View style={styles.weatherWidget}>
            <View style={styles.weatherInfoRow}>
              <Text style={styles.weatherIcon}>☀️</Text>
              <View style={styles.weatherTextContainer}>
                <Text style={styles.weatherLabel}>LIVE WEATHER</Text>
                <Text style={styles.weatherData}>42°F • Clear sky</Text>
              </View>
            </View>
            <Text style={styles.refreshIcon}>🔄</Text>
          </View>

          <Text style={styles.sectionLabel}>CREW IN ACTION — TAP TO JOIN IN</Text>
          
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.crewRow}>
            <View style={styles.crewCard}>
              <View style={styles.placeholderAvatar}><Text style={{color: '#fff'}}>🧑‍🦱</Text></View>
              <Text style={styles.cardTitleText}>Hydrate</Text>
              <Text style={styles.cardSubtitleText}>Log a glass</Text>
            </View>

            <View style={styles.crewCard}>
              <View style={styles.placeholderAvatar}><Text style={{color: '#fff'}}>🏋️‍♀️</Text></View>
              <Text style={styles.cardTitleText}>Work out</Text>
              <Text style={styles.cardSubtitleText}>5-min break</Text>
            </View>

            <View style={styles.crewCard}>
              <View style={styles.placeholderAvatar}><Text style={{color: '#fff'}}>🧘</Text></View>
              <Text style={styles.cardTitleText}>Stretch</Text>
              <Text style={styles.cardSubtitleText}>Best move</Text>
            </View>
          </ScrollView>
          
          <TouchableOpacity style={styles.closeButton} onPress={() => setBasecampVisible(false)}>
            <Text style={styles.closeButtonText}>Minimize Basecamp</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  roadLayer: { position: 'absolute', left: 0, right: 0, top: 0, width: '100%', height: SCREEN_HEIGHT, opacity: 0.18 },
  darkDarkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(13, 13, 13, 0.82)' },
  foregroundContent: { flex: 1, backgroundColor: 'transparent' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center', marginTop: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: { color: '#FFFFFF', fontSize: 24, marginRight: 12 },
  logoText: { color: '#D4AF37', fontWeight: 'bold', fontSize: 18 },
  subLogoText: { color: '#8E8E93', fontSize: 12 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  helpIcon: { color: '#FFFFFF', fontSize: 18, marginRight: 16 },
  profileCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1C1A14', borderWidth: 1, borderColor: '#D4AF37', justifyContent: 'center', alignItems: 'center' },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 8 },
  tabButton: { paddingVertical: 10, paddingHorizontal: 6 },
  activeTabButton: { borderBottomWidth: 2, borderBottomColor: '#D4AF37' },
  tabText: { color: '#8E8E93', fontSize: 13 },
  activeTabText: { color: '#D4AF37', fontWeight: 'bold' },
  paddedContent: { padding: 16 },
  heroText: { color: '#FFFFFF', fontSize: 26, fontWeight: 'bold', marginTop: 10, marginBottom: 8 },
  subHeroText: { color: '#8E8E93', fontSize: 15, marginBottom: 16 },
