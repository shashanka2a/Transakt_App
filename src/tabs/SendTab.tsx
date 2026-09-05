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
import { useTheme } from '../ThemeContext'
import { resolveEnsAddress } from '../services/ensv2Client'

const presets = ['$10', '$25', '$50', 'Max']
const noteOptions = [
  'Dinner split',
  'Weekly chore',
  'Rent split',
  'Groceries',
  'Custom…',
]

interface Props {
  onReview: () => void
  onBack: () => void
}

export default function SendTab({ onReview, onBack }: Props) {
  const { colors } = useTheme()
  const [query, setQuery] = useState('')
  const [resolved, setResolved] = useState(false)
  const [resolvedAddr, setResolvedAddr] = useState<string | null>(null)
  const [amount, setAmount] = useState('0.00')
  const [note, setNote] = useState('Dinner split')
  const [noteOpen, setNoteOpen] = useState(false)

  const handleQuery = async (v: string) => {
    setQuery(v)
    const clean = v.trim().toLowerCase().replace(/^\$/, '')

    if (clean.includes('mom') || clean.includes('alex') || clean.includes('dad')) {
      setResolved(true)
      setResolvedAddr('0x71C8...3F9E')
      return
    }

    if (clean.includes('.eth')) {
      const addr = await resolveEnsAddress(clean)
      if (addr) {
        setResolved(true)
        setResolvedAddr(`${addr.slice(0, 6)}...${addr.slice(-4)}`)
      } else {
        setResolved(true)
        setResolvedAddr('0x3F8a...Ea38')
      }
    } else {
      setResolved(false)
      setResolvedAddr(null)
    }
  }

  const handleKey = (k: string) => {
    setAmount((prev) => {
      if (k === '⌫') {
        const digits = prev.replace('.', '').slice(0, -1) || '0'
        return (parseInt(digits, 10) / 100).toFixed(2)
      }
      const digits = prev.replace('.', '').replace(/^0+/, '') + k
      return (parseInt(digits || '0', 10) / 100).toFixed(2)
    })
  }

  const numAmt = parseFloat(amount)
  const canSend = resolved && numAmt > 0

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
                    {(query.replace(/^\$/, '').charAt(0) || 'M').toUpperCase()}
                  </Text>
                </View>
                <View style={styles.recipientInfo}>
                  <View style={styles.recipientNameRow}>
                    <Text style={[styles.recipientName, { color: colors.fg }]}>
                      {query.includes('.') ? query.trim() : `${query.trim() || 'mom'}.smithfam.eth`}
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
            <Text
              style={[
                styles.amountValue,
                { color: numAmt > 0 ? colors.fg : colors.border2 },
              ]}
            >
              {amount}
            </Text>
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
          onPress={canSend ? onReview : undefined}
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
            {canSend ? 'Review & Send' : 'Enter Amount'}
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
