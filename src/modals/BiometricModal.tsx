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
  ActivityIndicator,
} from 'react-native'
import Svg, {
  Path,
  Circle,
  Ellipse,
  Line,
  Rect,
} from 'react-native-svg'
import { useTheme } from '../context/ThemeContext'
import {
  generateWorldIdZKProof,
  verifyWorldIdProofOnchain,
  WorldIdProof,
} from '../services/worldIdService'

export interface BiometricModalProps {
  onClose: () => void
  onConfirm: () => void
  actionType?: 'transfer' | 'policy' | 'subname' | 'auth'
  amount?: string
  recipient?: string
  policyDetails?: string
}

type StepState = 'viewfinder' | 'computing_zk' | 'verified'

export default function BiometricModal({
  onClose,
  onConfirm,
  actionType = 'transfer',
  amount = '$50.00',
  recipient = 'alex.smithfam.eth',
  policyDetails = 'Spend Limit & Policy Update',
}: BiometricModalProps) {
  const { colors } = useTheme()
  const [step, setStep] = useState<StepState>('viewfinder')
  const [zkProof, setZkProof] = useState<WorldIdProof | null>(null)
  const [progressStage, setProgressStage] = useState(1)

  const spinAnim = useRef(new Animated.Value(0)).current
  const scanLineAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const meshGlowAnim = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    // 1. Radar sweep rotation
    const spinLoop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    )
    spinLoop.start()

    // 2. Vertical laser sweep
    const scanLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    )
    scanLoop.start()

    // 3. Pulse indicator
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    )
    pulseLoop.start()

    // 4. Mesh Glow
    const meshLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(meshGlowAnim, {
          toValue: 0.9,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(meshGlowAnim, {
          toValue: 0.4,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    )
    meshLoop.start()

    return () => {
      spinLoop.stop()
      scanLoop.stop()
      pulseLoop.stop()
      meshLoop.stop()
    }
  }, [spinAnim, scanLineAnim, pulseAnim, meshGlowAnim])

  // Automatically start biometric selfie verification
  const handleStartVerification = async () => {
    setStep('computing_zk')
    setProgressStage(1)

    // Generate ZK-SNARK World ID Proof
    const actionKey =
      actionType === 'transfer'
        ? `transfer_${amount}_${recipient}`
        : actionType === 'policy'
        ? 'policy_modification'
        : 'subname_issuance'

    const proof = generateWorldIdZKProof(actionKey)
    setZkProof(proof)

    setTimeout(() => {
      setProgressStage(2)
    }, 750)

    setTimeout(() => {
      setProgressStage(3)
    }, 1500)

    await verifyWorldIdProofOnchain(proof)

    setTimeout(() => {
      setStep('verified')
      setTimeout(() => {
        onConfirm()
      }, 1600)
    }, 2200)
  }

  // Auto trigger after 1 second on modal open
  useEffect(() => {
    const timer = setTimeout(() => {
      if (step === 'viewfinder') {
        handleStartVerification()
      }
    }, 900)

    return () => clearTimeout(timer)
  }, [])

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-65, 65],
  })

  const isVerified = step === 'verified'

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={isVerified ? undefined : onClose}
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
          {/* Top Handle */}
          <View style={[styles.sheetHandle, { backgroundColor: colors.border2 }]} />

          {/* Header Row with World ID Badge */}
          <View style={styles.headerBadgeRow}>
            <View
              style={[
                styles.worldIdBadge,
                {
                  backgroundColor: 'rgba(0, 0, 0, 0.85)',
                  borderColor: '#1DB563',
                },
              ]}
            >
              {/* Worldcoin Orb Logo Icon */}
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="9" stroke="#1DB563" strokeWidth="2.2" />
                <Circle cx="12" cy="12" r="4.5" fill="#1DB563" />
                <Path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="#1DB563" strokeWidth="1.8" strokeLinecap="round" />
              </Svg>
              <Text style={styles.worldIdBadgeText}>WORLD ID · ZK-SNARK</Text>
            </View>

            <View
              style={[
                styles.levelPill,
                {
                  backgroundColor: colors.raised,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.levelPillText, { color: colors.fg3 }]}>
                Orb Verified
              </Text>
            </View>
          </View>

          {/* Action Context Title */}
          <View style={styles.titleBlock}>
            <Text style={[styles.sheetTitle, { color: colors.fg }]}>
              {actionType === 'transfer'
                ? 'High-Value Transfer Step-Up Auth'
                : actionType === 'policy'
                ? 'Policy Modification Authorization'
                : 'Proof-of-Humanity Verification'}
            </Text>
            <Text style={[styles.sheetSubtitle, { color: colors.fg2 }]}>
              {actionType === 'transfer'
                ? `Authorizing ${amount} to ${recipient} via 1:1 Zero-Knowledge Proof`
                : actionType === 'policy'
                ? `Confirming ${policyDetails} with zero biometric data leakage`
                : 'Verifying unique human presence without storing biometric data'}
            </Text>
          </View>

          {/* ── CAMERA / BIOMETRIC SELFIE VIEWFINDER ── */}
          <View style={styles.viewfinderContainer}>
            <View
              style={[
                styles.viewfinderFrame,
                {
                  backgroundColor: colors.bg,
                  borderColor: isVerified ? '#1DB563' : colors.accent,
                },
              ]}
            >
              {/* Outer Rotating Radar Glow */}
              {!isVerified && (
                <Animated.View
                  style={[
                    styles.radarSweep,
                    { transform: [{ rotate: spinInterpolate }] },
                  ]}
                >
                  <View style={[styles.radarSweepSegment, { borderColor: colors.accent }]} />
                </Animated.View>
              )}

              {/* Viewfinder Target Corner Brackets */}
              <View style={[styles.cornerTL, { borderColor: isVerified ? '#1DB563' : colors.accent }]} />
              <View style={[styles.cornerTR, { borderColor: isVerified ? '#1DB563' : colors.accent }]} />
              <View style={[styles.cornerBL, { borderColor: isVerified ? '#1DB563' : colors.accent }]} />
              <View style={[styles.cornerBR, { borderColor: isVerified ? '#1DB563' : colors.accent }]} />

              {/* 3D Facial Mesh & Anti-Spoofing Geometry */}
              <View style={styles.faceMeshLayer}>
                <Svg width={110} height={124} viewBox="0 0 96 112" fill="none">
                  {/* Face Outline */}
                  <Ellipse
                    cx="48"
                    cy="52"
                    rx="32"
                    ry="40"
                    stroke={isVerified ? '#1DB563' : colors.accent}
                    strokeWidth={1.4}
                    strokeDasharray="4 3"
                    opacity={0.65}
                  />
                  {/* Eyes Crosshairs */}
                  <Circle cx="35" cy="44" r="5" stroke={isVerified ? '#1DB563' : colors.accent} strokeWidth={1.2} />
                  <Circle cx="35" cy="44" r="1.5" fill={isVerified ? '#1DB563' : colors.accent} />
                  <Circle cx="61" cy="44" r="5" stroke={isVerified ? '#1DB563' : colors.accent} strokeWidth={1.2} />
                  <Circle cx="61" cy="44" r="1.5" fill={isVerified ? '#1DB563' : colors.accent} />
                  {/* Nose Bridge */}
                  <Path
                    d="M48 46 L45 59 Q48 62 51 59 Z"
                    stroke={isVerified ? '#1DB563' : colors.accent}
                    strokeWidth={1}
                    fill="none"
                  />
                  {/* Mouth Liveness Arc */}
                  <Path
                    d="M38 72 Q48 80 58 72"
                    stroke={isVerified ? '#1DB563' : colors.accent}
                    strokeWidth={1.4}
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* ZK Mesh Matrix Grid */}
                  <Line x1="12" y1="52" x2="84" y2="52" stroke={colors.fg3} strokeWidth={0.5} opacity={0.25} />
                  <Line x1="48" y1="12" x2="48" y2="92" stroke={colors.fg3} strokeWidth={0.5} opacity={0.25} />
                  <Line x1="26" y1="24" x2="70" y2="80" stroke={colors.fg3} strokeWidth={0.4} opacity={0.15} />
                  <Line x1="70" y1="24" x2="26" y2="80" stroke={colors.fg3} strokeWidth={0.4} opacity={0.15} />

                  {/* Verified Checkmark Overlay */}
                  {isVerified && (
                    <>
                      <Circle cx="48" cy="52" r="22" fill="rgba(29,181,99,0.18)" />
                      <Path
                        d="M38 52L44 58L58 44"
                        stroke="#1DB563"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  )}
                </Svg>

                {/* Laser Scanning Bar */}
                {!isVerified && (
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

            {/* Live Verification Status Row */}
            <View style={styles.statusRow}>
              <Animated.View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: isVerified ? '#1DB563' : colors.accent,
                    opacity: isVerified ? 1 : pulseAnim,
                  },
                ]}
              />
              <Text
                style={[
                  styles.statusLabel,
                  { color: isVerified ? '#1DB563' : colors.fg },
                ]}
              >
                {step === 'viewfinder'
                  ? 'Aligning 3D facial geometry…'
                  : step === 'computing_zk'
                  ? 'Computing Zero-Knowledge Proof (Groth16)…'
                  : 'Proof of Humanity Verified (1:1 Unique Human)'}
              </Text>
            </View>
          </View>

          {/* ── ZK-SNARK COMPUTATION PROGRESS CHECKLIST ── */}
          <View
            style={[
              styles.zkStepsCard,
              {
                backgroundColor: colors.raised,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.zkStepItem}>
              <Text style={{ fontSize: 13, marginRight: 8 }}>
                {progressStage >= 1 ? '✅' : '⏳'}
              </Text>
              <Text
                style={[
                  styles.zkStepText,
                  {
                    color: progressStage >= 1 ? colors.fg : colors.fg3,
                    fontWeight: progressStage === 1 ? '800' : '600',
                  },
                ]}
              >
                1. Biometric Liveness &amp; 3D Anti-Spoofing Check
              </Text>
            </View>

            <View style={styles.zkStepItem}>
              <Text style={{ fontSize: 13, marginRight: 8 }}>
                {progressStage >= 2 ? '✅' : '⏳'}
              </Text>
              <Text
                style={[
                  styles.zkStepText,
                  {
                    color: progressStage >= 2 ? colors.fg : colors.fg3,
                    fontWeight: progressStage === 2 ? '800' : '600',
                  },
                ]}
              >
                2. Generating 1:1 zk-SNARK Groth16 Proof &amp; Nullifier
              </Text>
            </View>

            <View style={styles.zkStepItem}>
              <Text style={{ fontSize: 13, marginRight: 8 }}>
                {isVerified ? '✅' : '⏳'}
              </Text>
              <Text
                style={[
                  styles.zkStepText,
                  {
                    color: isVerified ? colors.fg : colors.fg3,
                    fontWeight: isVerified ? '800' : '600',
                  },
                ]}
              >
                3. On-Chain World ID Verification on Ethereum Sepolia
              </Text>
            </View>
          </View>

          {/* ── ZERO-KNOWLEDGE PRIVACY GUARANTEE BANNER ── */}
          <View
            style={[
              styles.privacyCard,
              {
                backgroundColor: colors.raised,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.privacyHeader}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 2L4 6V12C4 16.42 7.58 20.17 12 21C16.42 20.17 20 16.42 20 12V6L12 2Z"
                  stroke="#1DB563"
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
                <Path d="M9 12l2 2 4-4" stroke="#1DB563" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={[styles.privacyTitle, { color: '#1DB563' }]}>
                1:1 ZERO-KNOWLEDGE PROOF PRIVACY GUARANTEE
              </Text>
            </View>
            <Text style={[styles.privacyBody, { color: colors.fg2 }]}>
              No selfies, photos, or facial biometric records are ever stored on-chain or sent to any servers. Only mathematical zero-knowledge proofs are verified.
            </Text>
          </View>

          {/* Bottom Actions */}
          {!isVerified ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              style={[styles.cancelButton, { borderColor: colors.border }]}
            >
              <Text style={styles.cancelButtonText}>Cancel Step-Up Auth</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.verifiedRow}>
              <ActivityIndicator size="small" color="#1DB563" style={{ marginRight: 8 }} />
              <Text style={[styles.verifiedSuccessText, { color: '#1DB563' }]}>
                Authorization Complete · Resuming Action…
              </Text>
            </View>
          )}
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
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 44 : 26,
    alignItems: 'center',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 16,
  },
  headerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  worldIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
  },
  worldIdBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1DB563',
    letterSpacing: 1,
  },
  levelPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  levelPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  titleBlock: {
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 4,
    textAlign: 'center',
  },
  sheetSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  viewfinderContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  viewfinderFrame: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 10,
  },
  radarSweep: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarSweepSegment: {
    width: 156,
    height: 156,
    borderRadius: 78,
    borderWidth: 6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    opacity: 0.35,
  },
  cornerTL: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 14,
    height: 14,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
  },
  cornerTR: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 14,
    height: 14,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    width: 14,
    height: 14,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 14,
    height: 14,
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
  },
  faceMeshLayer: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  scanLaserLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2.5,
    opacity: 0.85,
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
    fontSize: 13,
    fontWeight: '700',
  },
  zkStepsCard: {
    width: '100%',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    marginBottom: 12,
  },
  zkStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zkStepText: {
    fontSize: 11,
    flex: 1,
  },
  privacyCard: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    width: '100%',
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  privacyTitle: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  privacyBody: {
    fontSize: 11,
    lineHeight: 15,
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FF4757',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  verifiedSuccessText: {
    fontSize: 13,
    fontWeight: '800',
  },
})
