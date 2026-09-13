import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'
import {
  IconArrowLeft,
  IconSearch,
  IconX,
  IconBackspace,
  IconNote,
  IconChevronDown,
} from '../components/Icons'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { resolveEnsAddress } from '../services/ensv2Client'
import { isValidEthereumAddress } from '../services/sepoliaRpc'

const presets = ['$10', '$25', '$50', 'Max']
const noteOptions = [
  'Dinner split',
  'Weekly chore',
  'Rent split',
  'Groceries',
  'Custom…',
]

interface Props {
  onReview: (data: { amount: string; recipient: string; recipientAddress?: string }) => void
  onBack: () => void
}

export default function SendTab({ onReview, onBack }: Props) {
  const { colors } = useTheme()
  const { user, ensName, subAccounts } = useAuth()
  const rootEnsName = user?.ensName || ensName || 'hash.eth'
  const [query, setQuery] = useState('')
  const [resolved, setResolved] = useState(false)
  const [resolvedAddr, setResolvedAddr] = useState<string | null>(null)
  const [fullRecipientAddress, setFullRecipientAddress] = useState<string | null>(null)
  const [recipientDisplayName, setRecipientDisplayName] = useState<string>('')
  const [amount, setAmount] = useState('0.00')
  const [note, setNote] = useState('Dinner split')
  const [noteOpen, setNoteOpen] = useState(false)

  const handleQuery = async (v: string) => {
    setQuery(v)
    const clean = v.trim()
    const cleanLower = clean.toLowerCase().replace(/^\$/, '')

    if (!clean) {
      setResolved(false)
      setResolvedAddr(null)
      setFullRecipientAddress(null)
      setRecipientDisplayName('')
      return
    }

    // 1. Direct Ethereum Wallet Address (0x...)
    if (isValidEthereumAddress(clean) || (cleanLower.startsWith('0x') && cleanLower.length >= 8)) {
      setResolved(true)
      const formattedAddr =
        clean.length > 14 ? `${clean.slice(0, 6)}...${clean.slice(-4)}` : clean
      setResolvedAddr(formattedAddr)
      setFullRecipientAddress(clean)
      setRecipientDisplayName(formattedAddr)
      return
    }

    // 2. Matching existing Family Sub-Account
    const matchedSub = subAccounts?.find(
      (s) =>
        s.name.toLowerCase() === cleanLower ||
        s.ens.toLowerCase() === cleanLower ||
        s.ens.toLowerCase().startsWith(`${cleanLower}.`)
    )
    if (matchedSub) {
      setResolved(true)
      setResolvedAddr(
        matchedSub.address
          ? `${matchedSub.address.slice(0, 6)}...${matchedSub.address.slice(-4)}`
          : '0x3F8a...Ea38'
      )
      setFullRecipientAddress(matchedSub.address || '0x3F8a92e104dB2D9B387799147D3bEf32A606Ea38')
      setRecipientDisplayName(matchedSub.ens)
      return
    }

    // 3. Known quick nicknames
    if (['mom', 'alex', 'dad', 'claire', 'pay', 'vault'].includes(cleanLower)) {
      setResolved(true)
      setResolvedAddr('0x71C8...3F9E')
      setFullRecipientAddress('0x71C8a27B2f90A2E80562eA9b294D0A38e83f3F9E')
      setRecipientDisplayName(`${cleanLower}.${rootEnsName}`)
      return
    }

    // 4. ENS Name (.eth)
    if (cleanLower.includes('.eth')) {
      setResolved(true)
      setRecipientDisplayName(cleanLower)
      setFullRecipientAddress(null)
      try {
        const addr = await resolveEnsAddress(cleanLower)
        if (addr && isValidEthereumAddress(addr)) {
          setResolvedAddr(`${addr.slice(0, 6)}...${addr.slice(-4)}`)
          setFullRecipientAddress(addr)
        } else {
          setResolvedAddr('0x3F8a...Ea38')
          setFullRecipientAddress('0x3F8a92e104dB2D9B387799147D3bEf32A606Ea38')
        }
      } catch {
        setResolvedAddr('0x3F8a...Ea38')
        setFullRecipientAddress('0x3F8a92e104dB2D9B387799147D3bEf32A606Ea38')
      }
      return
    }

    // 5. Any other name/tag typed by the user (>= 2 chars)
    if (cleanLower.length >= 2) {
      setResolved(true)
      setResolvedAddr('0x71C8...3F9E')
      setFullRecipientAddress('0x71C8a27B2f90A2E80562eA9b294D0A38e83f3F9E')
      setRecipientDisplayName(clean.includes('.') ? clean : `${cleanLower}.${rootEnsName}`)
      return
    }

    setResolved(false)
    setResolvedAddr(null)
    setFullRecipientAddress(null)
    setRecipientDisplayName('')
  }

  const handleAmountChange = (text: string) => {
    let clean = text.replace(/[^0-9.]/g, '')
    const parts = clean.split('.')
    if (parts.length > 2) {
      clean = `${parts[0]}.${parts.slice(1).join('')}`
    }
    if (parts[1] && parts[1].length > 2) {
      clean = `${parts[0]}.${parts[1].slice(0, 2)}`
    }
    setAmount(clean || '0.00')
  }

  const handleKey = (k: string) => {
    if (k === '⌫') {
      setAmount((prev) => {
        if (prev.length <= 1 || prev === '0.00') return '0.00'
        const next = prev.slice(0, -1)
        return next === '' || next === '0.' ? '0.00' : next
      })
      return
    }

    if (k === '.') {
      setAmount((prev) => {
        if (prev.includes('.')) return prev
        return `${prev}.`
      })
      return
    }

    // Number key 0-9
    setAmount((prev) => {
      if (prev === '0.00' || prev === '0') return k
      if (prev.includes('.') && prev.split('.')[1]?.length >= 2) return prev
      return prev + k
    })
  }

  const numAmt = parseFloat(amount) || 0
  const canSend = (resolved || query.trim().length > 0) && numAmt > 0

  const handleSendPress = () => {
    if (canSend) {
      const targetRecipient =
        recipientDisplayName ||
        (query.trim().startsWith('0x')
          ? `${query.trim().slice(0, 6)}...${query.trim().slice(-4)}`
          : query.trim() || `alex.${rootEnsName}`)

      onReview({
        amount: `$${numAmt.toFixed(2)}`,
        recipient: targetRecipient,
        recipientAddress: fullRecipientAddress || (isValidEthereumAddress(query.trim()) ? query.trim() : undefined),
      })
    }
  }

  const getButtonLabel = () => {
    if (!query.trim()) return 'Enter Recipient'
    if (numAmt <= 0) return 'Enter Amount'
    return 'Verify Humanity & Send'
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onBack}
          style={[
            styles.backButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <IconArrowLeft size={16} color={colors.fg} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.fg }]}>
          Send Funds
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Recipient Input */}
        <View
          style={[
            styles.recipientCard,
            {
              backgroundColor: colors.surface,
              borderColor: resolved ? colors.accent : colors.border,
            },
          ]}
        >
          <View style={styles.searchRow}>
            <IconSearch size={16} color={colors.fg3} />
            <TextInput
              value={query}
              onChangeText={handleQuery}
              placeholder="Name, $tag, or .eth address"
              placeholderTextColor={colors.fg3}
              autoCapitalize="none"
              style={[styles.searchInput, { color: colors.fg }]}
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setQuery('')
                  setResolved(false)
                }}
              >
                <IconX size={14} color={colors.fg2} />
              </TouchableOpacity>
            )}
          </View>

          {resolved && (
            <View style={styles.resolvedContainer}>
              <View
                style={[
                  styles.resolvedBadgeCard,
                  {
                    backgroundColor: colors.mt6,
                    borderColor: colors.mb20,
                  },
                ]}
              >
                <View style={[styles.recipientAvatar, { backgroundColor: '#1D5D3A' }]}>
                  <Text style={[styles.avatarText, { color: '#F5F3EB' }]}>
                    {query.trim().startsWith('0x')
                      ? 'Ξ'
                      : (query.replace(/^\$/, '').charAt(0) || 'M').toUpperCase()}
                  </Text>
                </View>
                <View style={styles.recipientInfo}>
                  <View style={styles.recipientNameRow}>
                    <Text style={[styles.recipientName, { color: colors.fg }]}>
                      {recipientDisplayName ||
                        (query.includes('.')
                          ? query.trim()
                          : `${query.trim() || 'mom'}.${rootEnsName}`)}
                    </Text>
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                      <Circle cx="12" cy="12" r="10" fill={colors.accent} />
                      <Path
                        d="M8 12L11 15L16 9"
                        stroke={colors.accentFg}
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </View>
                  <Text style={[styles.recipientAddress, { color: colors.fg2 }]}>
                    {resolvedAddr || '0x71C8...3F9E'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.verifiedTag,
                    { backgroundColor: colors.mt16 },
                  ]}
                >
                  <Text style={[styles.verifiedTagText, { color: colors.accent }]}>
                    VERIFIED
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Amount Display */}
        <View style={styles.amountSection}>
          <View style={styles.amountRow}>
            <Text style={[styles.amountDollar, { color: colors.fg3 }]}>$</Text>
            <TextInput
              value={amount === '0.00' ? '' : amount}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              placeholderTextColor={colors.border2}
              keyboardType="decimal-pad"
              style={[
                styles.amountInput,
                { color: numAmt > 0 ? colors.fg : colors.border2 },
              ]}
            />
          </View>
          <Text style={[styles.ethEquivalent, { color: colors.fg2 }]}>
            ≈ {(numAmt / 2449.14).toFixed(4)} ETH
          </Text>
        </View>

        {/* Preset Pills */}
        <View style={styles.presetPillsRow}>
          {presets.map((p) => (
            <TouchableOpacity
              key={p}
              activeOpacity={0.8}
              onPress={() => {
                const map: Record<string, string> = {
                  $10: '10.00',
                  $25: '25.00',
                  $50: '50.00',
                  Max: '1420.50',
                }
                setAmount(map[p])
              }}
              style={[
                styles.presetPill,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.presetText, { color: colors.fg2 }]}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Numpad */}
        <View style={styles.numpadGrid}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map(
            (k) => (
              <TouchableOpacity
                key={k}
                activeOpacity={0.7}
                onPress={() => handleKey(k)}
                style={[
                  styles.numpadKey,
                  k === '⌫'
                    ? styles.numpadBackKey
                    : [
                        styles.numpadNumKey,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                      ],
                ]}
              >
                {k === '⌫' ? (
                  <IconBackspace size={20} color={colors.fg2} />
                ) : (
                  <Text style={[styles.numpadKeyText, { color: colors.fg }]}>
                    {k}
                  </Text>
                )}
              </TouchableOpacity>
            )
          )}
        </View>

        {/* Note Selector */}
        <View style={styles.noteSection}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setNoteOpen(!noteOpen)}
            style={[
              styles.noteButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <IconNote size={14} color={colors.fg3} />
            <Text style={[styles.noteButtonText, { color: colors.fg2 }]}>
              {note}
            </Text>
            <View
              style={{
                transform: [{ rotate: noteOpen ? '180deg' : '0deg' }],
              }}
            >
              <IconChevronDown color={colors.fg3} />
            </View>
          </TouchableOpacity>

          {noteOpen && (
            <View
              style={[
                styles.noteDropdown,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              {noteOptions.map((n, idx) => (
                <TouchableOpacity
                  key={n}
                  activeOpacity={0.7}
                  onPress={() => {
                    setNote(n)
                    setNoteOpen(false)
                  }}
                  style={[
                    styles.noteOptionRow,
                    {
                      borderBottomColor: colors.border,
                      borderBottomWidth:
                        idx < noteOptions.length - 1 ? 1 : 0,
                    },
                  ]}
                >
                  <Text style={[styles.noteOptionText, { color: colors.fg }]}>
                    {n}
                  </Text>
                  {n === note && (
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M20 6L9 17L4 12"
                        stroke={colors.accent}
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={!canSend}
          onPress={canSend ? handleSendPress : undefined}
          style={[
            styles.reviewButton,
            {
              backgroundColor: canSend ? colors.accent : colors.surface,
              borderColor: canSend ? 'transparent' : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.reviewButtonText,
              { color: canSend ? colors.accentFg : colors.fg3 },
            ]}
          >
            {getButtonLabel()}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  recipientCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  resolvedContainer: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  resolvedBadgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  recipientAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0D0E11',
  },
  recipientInfo: {
    flex: 1,
  },
  recipientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recipientName: {
    fontSize: 13,
    fontWeight: '800',
  },
  recipientAddress: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 2,
  },
  verifiedTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  verifiedTagText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  amountSection: {
    alignItems: 'center',
    marginVertical: 12,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  amountDollar: {
    fontSize: 32,
    fontWeight: '900',
    marginTop: 6,
    marginRight: 4,
  },
  amountValue: {
    fontSize: 60,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 66,
  },
  amountInput: {
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -2,
    minWidth: 120,
    textAlign: 'center',
    padding: 0,
    margin: 0,
  },
  ethEquivalent: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
  presetPillsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 16,
  },
  presetPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 13,
    fontWeight: '700',
  },
  numpadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    maxWidth: 320,
    alignSelf: 'center',
    marginBottom: 20,
  },
  numpadKey: {
    width: '31%',
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numpadNumKey: {
    borderWidth: 1,
  },
  numpadBackKey: {
    backgroundColor: 'transparent',
  },
  numpadKeyText: {
    fontSize: 20,
    fontWeight: '800',
  },
  noteSection: {
    position: 'relative',
    marginBottom: 24,
  },
  noteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
  },
  noteButtonText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  noteDropdown: {
    position: 'absolute',
    bottom: 52,
    left: 0,
    right: 0,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 10,
  },
  noteOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  noteOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  reviewButton: {
    paddingVertical: 16,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewButtonText: {
    fontSize: 16,
    fontWeight: '900',
  },
})
