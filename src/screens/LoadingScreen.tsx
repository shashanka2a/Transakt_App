import React, { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, Animated, Easing } from 'react-native'
import Svg, { Rect, Path } from 'react-native-svg'

interface Props {
  onDone: () => void
}

export default function LoadingScreen({ onDone }: Props) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(10)).current
  const progressAnim = useRef(new Animated.Value(0)).current
  const screenOpacity = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Phase 1: Reveal logo text & start progress bar
    const t1 = setTimeout(() => {
      setPhase(1)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: false,
        }),
      ]).start()
    }, 400)

    // Phase 2: Fade out loading screen
    const t2 = setTimeout(() => {
      setPhase(2)
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start()
    }, 2400)

    // Phase 3: Transition to next screen
    const t3 = setTimeout(() => {
      onDone()
    }, 2750)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [fadeAnim, slideAnim, progressAnim, screenOpacity, onDone])

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  })

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      {/* Logo Mark */}
      <View style={styles.centerBlock}>
        <TransaktMark size={72} color="#00FF87" />

        <Animated.View
          style={[
            styles.textBlock,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.title}>Transakt</Text>
          <Text style={styles.subtitle}>Family · Crypto · Simple</Text>
        </Animated.View>
      </View>

      {/* Loading Progress Bar */}
      <Animated.View style={[styles.barContainer, { opacity: fadeAnim }]}>
        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, { width: progressWidth }]} />
        </View>
      </Animated.View>
    </Animated.View>
  )
}

export function TransaktMark({
  size = 64,
  bgColor = '#1D5D3A',
  strokeColor = '#F5F3EB',
}: {
  size?: number
  color?: string
  bgColor?: string
  strokeColor?: string
}) {
  const s = size

  return (
    <View
      style={{
        width: s,
        height: s,
        shadowColor: bgColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
      }}
    >
      <Svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        {/* Background */}
        <Rect width="100" height="100" rx="26" fill={bgColor} />

        {/* Icon Path: T + forward transaction arrow */}
        <Path
          d="M33 39 L65 39 M45 39 L45 63 M55 29 L65 39 L55 49"
          fill="none"
          stroke={strokeColor}
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0D0E11',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  centerBlock: {
    alignItems: 'center',
    marginBottom: 32,
  },
  textBlock: {
    marginTop: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: '#5A6070',
    marginTop: 4,
  },
  barContainer: {
    width: 144,
  },
  barTrack: {
    height: 3,
    backgroundColor: '#1C1F26',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#00FF87',
    borderRadius: 2,
  },
})
