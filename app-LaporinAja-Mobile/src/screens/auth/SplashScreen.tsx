// ============================================
// SplashScreen - LaporinAja Mobile
// Matching design exactly: Light green bg,
// white icon in rounded box, tagline, progress bar.
// ============================================
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const { width } = Dimensions.get('window');

const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start(() => {
      setTimeout(onFinish, 500);
    });
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={s.container}>
      <Animated.View style={[s.content, { opacity: fadeAnim }]}>
        {/* Logo Icon in Rounded Box */}
        <View style={s.logoBox}>
          <MaterialCommunityIcons name="home" size={80} color="#9FCB98" />
        </View>

        {/* Brand Name */}
        <Text style={s.brand}>LaporinAja</Text>
      </Animated.View>

      {/* Footer: Progress Bar and Version */}
      <View style={s.footer}>
        <View style={s.progressBg}>
          <Animated.View style={[s.progressFill, { width: progressWidth }]} />
        </View>
        <Text style={s.version}>VERSI 1.0.0</Text>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#ffffff', // White background
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  content: { 
    alignItems: 'center',
    marginTop: -50,
  },
  logoBox: { 
    width: 160, 
    height: 160, 
    borderRadius: 40, 
    backgroundColor: '#ffffff', // White background
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  brand: { 
    fontSize: 40, 
    fontWeight: '900', 
    color: '#9FCB98', // Light green color
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  tagline: { 
    fontSize: 16, 
    fontStyle: 'italic', 
    color: '#475569', // Gray text
    fontWeight: '500',
  },
  footer: { 
    position: 'absolute', 
    bottom: 60, 
    alignItems: 'center',
    width: '100%',
  },
  progressBg: { 
    width: width * 0.3, 
    height: 4, 
    backgroundColor: '#e2e8f0', // Light gray background
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 15,
  },
  progressFill: { 
    height: '100%', 
    backgroundColor: '#2d5a1e', // Dark green like web
    borderRadius: 2 
  },
  version: { 
    color: '#94a3b8', // Gray version text
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
});

export default SplashScreen;
