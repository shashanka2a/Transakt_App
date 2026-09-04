import React, { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, Animated, Easing } from 'react-native'
import Svg, { Rect, Line, Path } from 'react-native-svg'

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
  color = '#00FF87',
}: {
  size?: number
  color?: string
}) {
  const s = size

  return (
    <Svg width={s} height={s} viewBox="0 0 64 64" fill="none">
      {/* Rounded-square container */}
      <Rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="16"
        stroke={color}
        strokeWidth="1.8"
        fill="none"
      />
      {/* T crossbar (horizontal line) */}
      <Line
        x1="14"
        y1="22"
        x2="42"
        y2="22"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* T stem (vertical) */}
      <Line
        x1="28"
        y1="22"
        x2="28"
        y2="46"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Arrow shaft extending crossbar right */}
      <Line
        x1="42"
        y1="22"
        x2="50"
        y2="22"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Arrowhead */}
      <Path
        d="M45 16.5L51 22L45 27.5"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
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
