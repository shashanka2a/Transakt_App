import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Modal,
} from 'react-native'
import Svg, { Rect, Path, Circle } from 'react-native-svg'
import { TransaktMark } from './LoadingScreen'
import { MetaMaskIcon, WalletConnectIcon, IconX } from '../components/Icons'
import { useTheme } from '../ThemeContext'
import { useAuth } from '../AuthContext'

interface Props {
  onContinue: () => void
}

export default function WelcomeScreen({ onContinue }: Props) {
  const { colors } = useTheme()
  const {
    isLoading,
    error,
    sendEmailMagicLink,
    verifyEmailOtp,
    connectExternalWallet,
    pendingEmail,
  } = useAuth()

  const [email, setEmail] = useState('')
  const [focused, setFocused] = useState(false)
  const [emailStep, setEmailStep] = useState<'input' | 'otp'>('input')
  const [otpCode, setOtpCode] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [showWalletModal, setShowWalletModal] = useState(false)

  // 1. Handle Email Submit
  const handleSendEmail = async () => {
    if (!email.trim() || !email.includes('@')) {
      setLocalError('Please enter a valid email address.')
      return
    }

    setLocalError(null)
    const success = await sendEmailMagicLink(email.trim())
    if (success) {
      setEmailStep('otp')
    }
  }

  // 2. Handle OTP Code Verification
  const handleVerifyOtp = async () => {
    if (otpCode.trim().length < 4) {
      setLocalError('Please enter the 6-digit code from your email.')
      return
    }

    setLocalError(null)
    const success = await verifyEmailOtp(otpCode.trim())
    if (success) {
      onContinue()
    } else {
      setLocalError('Invalid or expired code. Please check your email or tap Resend.')
    }
  }

  // 3. Handle External Wallet
  const handleConnectWallet = async (type: 'metamask' | 'walletconnect') => {
    setShowWalletModal(false)
    const success = await connectExternalWallet(type)
    if (success) {
      onContinue()
    }
  }

  const activeError = localError || error

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.bg }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoWrapper}>
            <TransaktMark size={72} color={colors.accent} />
          </View>

          <Text style={[styles.title, { color: colors.fg }]}>Transakt</Text>
          <Text style={[styles.subtitle, { color: colors.fg2 }]}>
            Family crypto, finally simple.
          </Text>

          {/* Trust chips */}
          <View style={styles.trustChipsRow}>
            {['No seed phrase', 'ENS native', 'Zero gas fees'].map((tag) => (
              <View
                key={tag}
                style={[
                  styles.trustChip,
                  {
                    backgroundColor: colors.raised,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.trustChipText, { color: colors.fg3 }]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Primary Auth Section (Email Magic Link / OTP) */}
        <View style={styles.authSection}>
          {activeError && (
            <View
              style={[
                styles.errorBox,
                {
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                },
              ]}
            >
              <Text style={styles.errorText}>{activeError}</Text>
            </View>
          )}

          {emailStep === 'input' ? (
            <View style={styles.emailContainer}>
              <View
                style={[
                  styles.inputRow,
                  {
                    backgroundColor: colors.surface,
                    borderColor: focused ? colors.accent : colors.border,
                    borderWidth: focused ? 1.5 : 1,
                  },
                ]}
              >
                <View style={styles.mailIcon}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Rect
                      x="2"
                      y="4"
                      width="20"
                      height="16"
                      rx="2"
                      stroke={colors.fg3}
                      strokeWidth={1.6}
                    />
                    <Path
                      d="M2 8l10 6 10-6"
                      stroke={colors.fg3}
                      strokeWidth={1.6}
                      strokeLinecap="round"
                    />
                  </Svg>
                </View>
                <TextInput
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text)
                    if (localError) setLocalError(null)
                  }}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="your@email.com"
                  placeholderTextColor={colors.fg3}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[styles.inputField, { color: colors.fg }]}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSendEmail}
                disabled={!email.trim() || isLoading}
                style={[
                  styles.submitButton,
                  {
                    backgroundColor: email.trim() ? colors.accent : colors.raised,
                    opacity: isLoading ? 0.7 : 1,
                  },
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.accentFg} size="small" />
                ) : (
                  <Text
                    style={[
                      styles.submitButtonText,
                      {
                        color: email.trim() ? colors.accentFg : colors.fg3,
                      },
                    ]}
                  >
                    Continue with Email
                  </Text>
                )}
              </TouchableOpacity>

              <Text style={[styles.inputSubtext, { color: colors.fg3 }]}>
                We'll send a 6-digit verification code · No password needed
              </Text>
            </View>
          ) : (
            <View style={styles.otpContainer}>
              <View
                style={[
                  styles.sentBox,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.sentHeader}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="10" fill={colors.accent} />
                    <Path
                      d="M8 12L11 15L16 9"
                      stroke={colors.accentFg}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                  <Text style={[styles.sentTitle, { color: colors.accent }]}>
                    Code sent to {pendingEmail || email}
                  </Text>
                </View>

                {/* OTP Input */}
                <View style={styles.otpInputWrapper}>
                  <TextInput
                    value={otpCode}
                    onChangeText={(text) => {
                      setOtpCode(text)
                      if (localError) setLocalError(null)
                    }}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor={colors.fg3}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                    style={[
                      styles.otpInputField,
                      {
                        backgroundColor: colors.raised,
                        borderColor: colors.border,
                        color: colors.fg,
                      },
                    ]}
                  />

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleVerifyOtp}
                    disabled={otpCode.length < 4 || isLoading}
                    style={[
                      styles.verifyButton,
                      {
                        backgroundColor:
                          otpCode.length >= 4 ? colors.accent : colors.raised,
                      },
                    ]}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={colors.accentFg} size="small" />
                    ) : (
                      <Text
                        style={[
                          styles.verifyButtonText,
                          {
                            color:
                              otpCode.length >= 4
                                ? colors.accentFg
                                : colors.fg3,
                          },
                        ]}
                      >
                        Verify Code
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Resend and change email actions */}
                <View style={styles.otpFooterRow}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleSendEmail}
                    disabled={isLoading}
                    style={styles.resendCodeButton}
                  >
                    <Text style={[styles.resendCodeText, { color: colors.accent }]}>
                      Resend code
                    </Text>
                  </TouchableOpacity>

                  <Text style={{ color: colors.fg3, fontSize: 11 }}>•</Text>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      setEmailStep('input')
                      setOtpCode('')
                      setLocalError(null)
                    }}
                    style={styles.changeEmailButton}
                  >
                    <Text style={[styles.changeEmailText, { color: colors.fg3 }]}>
                      Use different email
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.fg3 }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>
        </View>

        {/* External wallet & terms */}
        <View style={styles.footerSection}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowWalletModal(true)}
            style={[
              styles.walletButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.walletIconsRow}>
              <MetaMaskIcon size={20} />
              <WalletConnectIcon size={20} />
            </View>
            <Text style={[styles.walletButtonText, { color: colors.fg2 }]}>
              Connect External Wallet
            </Text>
          </TouchableOpacity>

          <Text style={[styles.termsText, { color: colors.fg3 }]}>
            By continuing you agree to our{' '}
            <Text style={{ color: colors.accent, textDecorationLine: 'underline' }}>
              Terms
            </Text>
            {' and '}
            <Text style={{ color: colors.accent, textDecorationLine: 'underline' }}>
              Privacy
            </Text>
          </Text>
        </View>
      </ScrollView>

      {/* External Wallet Modal */}
      <Modal
        visible={showWalletModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWalletModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.fg }]}>
                Connect Wallet
              </Text>
              <TouchableOpacity
                onPress={() => setShowWalletModal(false)}
                style={[styles.closeModalBtn, { backgroundColor: colors.raised }]}
              >
                <IconX size={14} color={colors.fg2} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: colors.fg3 }]}>
              Link an existing Ethereum wallet to manage your Family Treasury.
            </Text>

            <View style={styles.walletList}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleConnectWallet('metamask')}
                style={[
                  styles.walletOption,
                  {
                    backgroundColor: colors.raised,
                    borderColor: colors.border,
                  },
                ]}
              >
                <MetaMaskIcon size={26} />
                <View style={styles.walletOptionInfo}>
                  <Text style={[styles.walletOptionName, { color: colors.fg }]}>
                    MetaMask
                  </Text>
                  <Text style={[styles.walletOptionDesc, { color: colors.fg3 }]}>
                    Connect with browser or mobile extension
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleConnectWallet('walletconnect')}
                style={[
                  styles.walletOption,
                  {
                    backgroundColor: colors.raised,
                    borderColor: colors.border,
                  },
                ]}
              >
                <WalletConnectIcon size={26} />
                <View style={styles.walletOptionInfo}>
                  <Text style={[styles.walletOptionName, { color: colors.fg }]}>
                    WalletConnect
                  </Text>
                  <Text style={[styles.walletOptionDesc, { color: colors.fg3 }]}>
                    Scan QR with Rainbow, Trust, or Phantom
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 8,
  },
  logoWrapper: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  trustChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  trustChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  trustChipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  authSection: {
    width: '100%',
    marginVertical: 20,
    gap: 14,
  },
  errorBox: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  emailContainer: {
    width: '100%',
    gap: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 54,
  },
  mailIcon: {
    paddingLeft: 2,
    paddingRight: 10,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  submitButton: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '900',
  },
  inputSubtext: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  otpContainer: {
    width: '100%',
  },
  sentBox: {
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 14,
  },
  sentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sentTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  otpInputWrapper: {
    width: '100%',
    gap: 10,
  },
  otpInputField: {
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
  },
  verifyButton: {
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    fontSize: 14,
    fontWeight: '900',
  },
  otpFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  resendCodeButton: {
    paddingVertical: 4,
  },
  resendCodeText: {
    fontSize: 11,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  changeEmailButton: {
    paddingVertical: 4,
  },
  changeEmailText: {
    fontSize: 11,
    textDecorationLine: 'underline',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '600',
  },
  footerSection: {
    alignItems: 'center',
    gap: 14,
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  walletIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  walletButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  termsText: {
    fontSize: 11,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  closeModalBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  walletList: {
    gap: 10,
    marginTop: 4,
  },
  walletOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  walletOptionInfo: {
    flex: 1,
  },
  walletOptionName: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  walletOptionDesc: {
    fontSize: 11,
  },
})
