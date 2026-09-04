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
} from 'react-native'
import Svg, { Rect, Path, Circle } from 'react-native-svg'
import { TransaktMark } from './LoadingScreen'
import { PasskeyIcon, MetaMaskIcon, WalletConnectIcon } from '../components/Icons'
import { useTheme } from '../ThemeContext'

interface Props {
  onContinue: () => void
}

export default function WelcomeScreen({ onContinue }: Props) {
  const { colors } = useTheme()
  const [email, setEmail] = useState('')
  const [focused, setFocused] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSendEmail = () => {
    if (email.trim().length > 0) {
      setSent(true)
    }
  }

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
            {['No seed phrase', 'ENS native', 'Biometric auth'].map((tag) => (
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

        {/* Auth Section */}
        <View style={styles.authSection}>
          {/* Passkey CTA */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onContinue}
            style={[
              styles.passkeyButton,
              {
                backgroundColor: colors.accent,
                shadowColor: colors.accent,
              },
            ]}
          >
            <PasskeyIcon size={20} color={colors.accentFg} />
            <Text style={[styles.passkeyButtonText, { color: colors.accentFg }]}>
              Continue with Passkey
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.fg3 }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Email magic link */}
          {!sent ? (
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
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Rect x="2" y="4" width="20" height="16" rx="2" stroke={colors.fg3} strokeWidth={1.6} />
                    <Path d="M2 8l10 6 10-6" stroke={colors.fg3} strokeWidth={1.6} strokeLinecap="round" />
                  </Svg>
                </View>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="your@email.com"
                  placeholderTextColor={colors.fg3}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[styles.inputField, { color: colors.fg }]}
                />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleSendEmail}
                  disabled={!email.trim()}
                  style={[
                    styles.sendIconButton,
                    {
                      backgroundColor: email.trim() ? colors.accent : colors.raised,
                    },
                  ]}
                >
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke={email.trim() ? colors.accentFg : colors.fg3}
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </TouchableOpacity>
              </View>
              <Text style={[styles.inputSubtext, { color: colors.fg3 }]}>
                Magic link, no password needed
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.sentBox,
                {
                  backgroundColor: colors.mt10,
                  borderColor: colors.mb20,
                },
              ]}
            >
              <View style={styles.sentHeader}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="12" r="10" fill={colors.accent} />
                  <Path d="M8 12L11 15L16 9" stroke={colors.accentFg} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={[styles.sentTitle, { color: colors.accent }]}>Link sent!</Text>
              </View>
              <Text style={[styles.sentSubtitle, { color: colors.fg2 }]}>Check {email}</Text>
            </View>
          )}
        </View>

        {/* External wallet & terms */}
        <View style={styles.footerSection}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onContinue}
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
            <Text style={{ color: colors.accent, textDecorationLine: 'underline' }}>Terms</Text>
            {' and '}
            <Text style={{ color: colors.accent, textDecorationLine: 'underline' }}>Privacy</Text>
          </Text>
        </View>
      </ScrollView>
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
    marginVertical: 24,
    gap: 12,
  },
  passkeyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 28,
    gap: 10,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  passkeyButtonText: {
    fontSize: 16,
    fontWeight: '900',
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
  emailContainer: {
    width: '100%',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 52,
  },
  mailIcon: {
    paddingLeft: 4,
    paddingRight: 8,
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  sendIconButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputSubtext: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 6,
    marginLeft: 6,
  },
  sentBox: {
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  sentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  sentTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  sentSubtitle: {
    fontSize: 12,
    fontWeight: '500',
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
})
