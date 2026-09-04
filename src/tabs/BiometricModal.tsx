import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  Platform,
} from 'react-native'
import Svg, {
  Path,
  Circle,
  Ellipse,
  Line,
} from 'react-native-svg'
import { useTheme } from '../ThemeContext'

interface Props {
  onClose: () => void
  onConfirm: () => void
}

type ScanState = 'scanning' | 'detected' | 'verified'

export default function BiometricModal({ onClose, onConfirm }: Props) {
  const { colors } = useTheme()
  const [state, setState] = useState<ScanState>('scanning')

  const spinAnim = useRef(new Animated.Value(0)).current
  const scanLineAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Spin animation for radar sweep
    const spinLoop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    )
    spinLoop.start()

    // Scan line vertical float
    const scanLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    )
    scanLoop.start()

    // Pulse dot
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    )
    pulseLoop.start()

    // Sequence timers
    const t1 = setTimeout(() => setState('detected'), 2200)
    const t2 = setTimeout(() => setState('verified'), 3800)
    const t3 = setTimeout(() => onConfirm(), 4600)

    return () => {
      spinLoop.stop()
      scanLoop.stop()
      pulseLoop.stop()
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [onConfirm, spinAnim, scanLineAnim, pulseAnim])

  const ok = state === 'verified'

  const label = {
    scanning: 'Scanning liveness…',
    detected: 'Face detected…',
    verified: 'Identity confirmed',
  }[state]

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 60],
  })

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
            },
          ]}
        >
          {/* Handle */}
          <View style={[styles.sheetHandle, { backgroundColor: colors.border2 }]} />

          {/* Shield Icon Badge */}
          <View
            style={[
              styles.shieldBadge,
              {
                backgroundColor: colors.raised,
                borderColor: colors.border,
              },
            ]}
          >
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 2L4 6V12C4 16.42 7.58 20.17 12 21C16.42 20.17 20 16.42 20 12V6L12 2Z"
                stroke={ok ? colors.accent : colors.fg2}
                strokeWidth={1.8}
                strokeLinejoin="round"
                fill="none"
              />
              <Circle cx="12" cy="12" r="2.5" fill={ok ? colors.accent : colors.fg3} />
            </Svg>
          </View>

          {/* Title & Description */}
          <View style={styles.titleBlock}>
            <Text style={[styles.sheetTitle, { color: colors.fg }]}>
              Biometric Verification Required
            </Text>
            <Text style={[styles.sheetSubtitle, { color: colors.fg2 }]}>
              This transfer needs a quick human check{'\n'}before it's authorized.
            </Text>
          </View>

          {/* Face scan ring */}
          <View style={styles.scanViewportContainer}>
            <View style={styles.scanRing}>
              {/* Outer border */}
              <Svg width={190} height={190} viewBox="0 0 200 200" style={StyleSheet.absoluteFill}>
                <Circle cx="100" cy="100" r="88" stroke={colors.border} strokeWidth={2.2} fill="none" />
                <Circle
                  cx="100"
                  cy="100"
                  r="88"
                  stroke={ok ? colors.accent : '#1DB563'}
                  strokeWidth={3}
                  strokeDasharray={553}
                  strokeDashoffset={state === 'scanning' ? 450 : state === 'detected' ? 220 : 0}
                  strokeLinecap="round"
                  fill="none"
                />
              </Svg>

              {/* Rotating radar sweep */}
              {!ok && (
                <Animated.View
                  style={[
                    styles.radarSweep,
                    { transform: [{ rotate: spinInterpolate }] },
                  ]}
                >
                  <View style={[styles.radarSweepSegment, { borderColor: colors.accent }]} />
                </Animated.View>
              )}

              {/* Facial Mesh Inner */}
              <View
                style={[
                  styles.faceMeshInner,
                  {
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Svg width={96} height={112} viewBox="0 0 96 112" fill="none">
                  <Ellipse
                    cx="48"
                    cy="52"
                    rx="30"
                    ry="38"
                    stroke={ok ? colors.accent : colors.fg3}
                    strokeWidth={1.2}
                    strokeDasharray="4 3"
                    opacity={0.5}
                  />
                  <Ellipse cx="35" cy="45" rx="6" ry="4.5" stroke={ok ? colors.accent : colors.fg3} strokeWidth={1.3} />
                  <Ellipse cx="61" cy="45" rx="6" ry="4.5" stroke={ok ? colors.accent : colors.fg3} strokeWidth={1.3} />
                  <Path d="M48 52 L44 63 Q48 66 52 63 Z" stroke={ok ? colors.accent : colors.fg3} strokeWidth={1} fill="none" />
                  <Path d="M38 73 Q48 80 58 73" stroke={ok ? colors.accent : colors.fg3} strokeWidth={1.3} strokeLinecap="round" fill="none" />
                  <Line x1="14" y1="52" x2="82" y2="52" stroke={colors.fg3} strokeWidth={0.4} opacity={0.18} />
                  <Line x1="48" y1="14" x2="48" y2="90" stroke={colors.fg3} strokeWidth={0.4} opacity={0.18} />

                  {ok && (
                    <>
                      <Circle cx="48" cy="52" r="18" fill="rgba(0,255,135,0.12)" />
                      <Path
                        d="M39 52L45 58L57 46"
                        stroke={colors.accent}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  )}
                </Svg>

                {/* Laser scan line moving vertically */}
                {state === 'scanning' && (
                  <Animated.View
                    style={[
                      styles.scanLaserLine,
                      {
                        backgroundColor: colors.accent,
                        transform: [{ translateY: scanLineTranslateY }],
                      },
                    ]}
                  />
                )}
              </View>
            </View>

            {/* Status indicator */}
            <View style={styles.statusRow}>
              <Animated.View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: ok ? colors.accent : '#1DB563',
                    opacity: ok ? 1 : pulseAnim,
                  },
                ]}
              />
              <Text
                style={[
                  styles.statusLabel,
                  { color: ok ? colors.accent : colors.fg2 },
                ]}
              >
                {label}
              </Text>
            </View>
          </View>

          {/* Privacy Notice */}
          <View
            style={[
              styles.privacyPill,
              {
                backgroundColor: colors.raised,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.privacyText, { color: colors.fg2 }]}>
              Proving unique human presence · Zero biometric data stored onchain
            </Text>
          </View>

          {/* Cancel button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClose}
            style={[styles.cancelButton, { borderColor: colors.border }]}
          >
            <Text style={styles.cancelButtonText}>Cancel Transaction</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
    alignItems: 'center',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 20,
  },
  shieldBadge: {
    width: 52,
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  titleBlock: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 6,
    textAlign: 'center',
  },
  sheetSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  scanViewportContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scanRing: {
    width: 190,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 12,
  },
  radarSweep: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarSweepSegment: {
    width: 176,
    height: 176,
    borderRadius: 88,
    borderWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    opacity: 0.25,
  },
  faceMeshInner: {
    width: 154,
    height: 154,
    borderRadius: 77,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  scanLaserLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  privacyPill: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 16,
    width: '100%',
  },
  privacyText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF4757',
  },
})
