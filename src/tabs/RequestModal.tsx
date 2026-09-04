import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Platform,
} from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'
import {
  IconSearch,
  IconX,
  IconBackspace,
  IconNote,
  IconChevronDown,
} from '../components/Icons'
import { useTheme } from '../ThemeContext'

type Step = 'compose' | 'sent'

interface Props {
  onClose: () => void
}

const noteOptions = [
  'Dinner split',
  'Rent contribution',
  'Weekly groceries',
  'Event tickets',
  'Custom…',
]

const suggestions = [
  {
    name: '$mom.smith.fam.eth',
    sub: '0x8F3a…42b',
    initials: 'MS',
    verified: true,
  },
  {
    name: '$dad.smith.fam.eth',
    sub: '0x4A1b…91c',
    initials: 'DS',
    verified: true,
  },
  {
    name: '$alex.work',
    sub: '0x2C9d…33f',
    initials: 'AW',
    verified: false,
  },
]

export default function RequestModal({ onClose }: Props) {
  const { colors } = useTheme()
  const [step, setStep] = useState<Step>('compose')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<(typeof suggestions)[0] | null>(null)
  const [amount, setAmount] = useState('0.00')
  const [note, setNote] = useState('Dinner split')
  const [noteOpen, setNoteOpen] = useState(false)

  const handleKey = (k: string) => {
    setAmount((prev) => {
      if (k === '⌫') {
        const d = prev.replace('.', '').slice(0, -1) || '0'
        return (parseInt(d, 10) / 100).toFixed(2)
      }
      const d = prev.replace('.', '').replace(/^0+/, '') + k
      return (parseInt(d || '0', 10) / 100).toFixed(2)
    })
  }

  const numAmt = parseFloat(amount)
  const canSend = selected && numAmt > 0

  const filtered = suggestions.filter(
    (s) => !query || s.name.toLowerCase().includes(query.toLowerCase())
  )

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

          {step === 'sent' ? (
            /* Sent Success State */
            <View style={styles.sentContainer}>
              <View
                style={[
                  styles.sentIconCircle,
                  {
                    backgroundColor: colors.mt16,
                    borderColor: colors.accent,
                  },
                ]}
              >
                <Svg width={36} height={36} viewBox="0 0 36 36" fill="none">
                  <Path
                    d="M8 18L14 24L28 10"
                    stroke={colors.accent}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>

              <Text style={[styles.sentHeaderLabel, { color: colors.fg2 }]}>
                Request Sent
              </Text>
              <Text style={[styles.sentAmount, { color: colors.fg }]}>
                ${parseFloat(amount).toFixed(2)}
              </Text>
              <Text style={[styles.sentTarget, { color: colors.fg2 }]}>
                Requested from{' '}
                <Text style={{ fontWeight: '800', color: colors.fg }}>
                  {selected?.name}
                </Text>
              </Text>
              <Text style={[styles.sentNote, { color: colors.fg3 }]}>
                "{note}"
              </Text>

              <View
                style={[
                  styles.pendingCard,
                  {
                    backgroundColor: colors.raised,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.pendingText, { color: colors.fg2 }]}>
                  They'll receive a notification
                </Text>
                <View style={styles.pendingBadge}>
                  <View
                    style={[
                      styles.pendingDot,
                      { backgroundColor: colors.accent },
                    ]}
                  />
                  <Text
                    style={[styles.pendingBadgeText, { color: colors.accent }]}
                  >
                    PENDING
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onClose}
                style={[styles.sentDoneBtn, { backgroundColor: colors.accent }]}
              >
                <Text style={[styles.sentDoneBtnText, { color: colors.accentFg }]}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Compose State */
            <ScrollView
              style={styles.sheetScroll}
              contentContainerStyle={styles.sheetScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Header */}
              <View style={styles.composeHeader}>
                <View>
                  <Text style={[styles.composeTitle, { color: colors.fg }]}>
                    Request Money
                  </Text>
                  <Text style={[styles.composeSubtitle, { color: colors.fg2 }]}>
                    Ask someone to pay you
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onClose}
                  style={[
                    styles.closeBtn,
                    {
                      backgroundColor: colors.raised,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <IconX size={14} color={colors.fg2} />
                </TouchableOpacity>
              </View>

              {/* Contact Search / Selected */}
              <View style={styles.contactSection}>
                {selected ? (
                  <View
                    style={[
                      styles.selectedContactCard,
                      {
                        backgroundColor: colors.mt10,
                        borderColor: colors.mb20,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.contactAvatar,
                        { backgroundColor: '#00FF87' },
                      ]}
                    >
                      <Text style={styles.avatarText}>{selected.initials}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.contactName, { color: colors.fg }]}>
                        {selected.name}
                      </Text>
                      <Text style={[styles.contactSub, { color: colors.fg2 }]}>
                        {selected.sub}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setSelected(null)}
                      style={[
                        styles.removeContactBtn,
                        { backgroundColor: colors.raised },
                      ]}
                    >
                      <IconX size={10} color={colors.fg3} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View>
                    <View
                      style={[
                        styles.searchContactRow,
                        {
                          backgroundColor: colors.raised,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <IconSearch size={16} color={colors.fg3} />
                      <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Search name or $tag…"
                        placeholderTextColor={colors.fg3}
                        style={[styles.searchContactInput, { color: colors.fg }]}
                      />
                    </View>

                    {filtered.length > 0 && (
                      <View
                        style={[
                          styles.suggestionsBox,
                          {
                            backgroundColor: colors.raised,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        {filtered.map((s, idx) => (
                          <TouchableOpacity
                            key={s.name}
                            activeOpacity={0.7}
                            onPress={() => {
                              setSelected(s)
                              setQuery('')
                            }}
                            style={[
                              styles.suggestionRow,
                              {
                                borderBottomColor: colors.border,
                                borderBottomWidth:
                                  idx < filtered.length - 1 ? 1 : 0,
                              },
                            ]}
                          >
                            <View
                              style={[
                                styles.suggestionAvatar,
                                { backgroundColor: colors.surface },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.suggestionAvatarText,
                                  { color: colors.accent },
                                ]}
                              >
                                {s.initials}
                              </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <View style={styles.suggestionNameRow}>
                                <Text
                                  style={[
                                    styles.suggestionName,
                                    { color: colors.fg },
                                  ]}
                                >
                                  {s.name}
                                </Text>
                                {s.verified && (
                                  <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                                    <Circle cx="12" cy="12" r="10" fill={colors.accent} />
                                    <Path
                                      d="M8 12L11 15L16 9"
                                      stroke={colors.accentFg}
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </Svg>
                                )}
                              </View>
                              <Text
                                style={[
                                  styles.suggestionSub,
                                  { color: colors.fg3 },
                                ]}
                              >
                                {s.sub}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* Amount Entry */}
              <View style={styles.amountDisplayBlock}>
                <Text style={[styles.amountLabel, { color: colors.fg2 }]}>
                  Amount
                </Text>
                <View style={styles.amountTextRow}>
                  <Text style={[styles.amountDollarSymbol, { color: colors.fg3 }]}>
                    $
                  </Text>
                  <Text
                    style={[
                      styles.amountNumber,
                      { color: numAmt > 0 ? colors.fg : colors.border2 },
                    ]}
                  >
                    {amount}
                  </Text>
                </View>
                <Text style={[styles.amountEthApprox, { color: colors.fg3 }]}>
                  ≈ {(numAmt / 2449.14).toFixed(4)} ETH
                </Text>
              </View>

              {/* Numpad */}
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
                          ? styles.numpadKeyBack
                          : [
                              styles.numpadKeyNum,
                              {
                                backgroundColor: colors.raised,
                                borderColor: colors.border,
                              },
                            ],
                      ]}
                    >
                      {k === '⌫' ? (
                        <IconBackspace size={18} color={colors.fg2} />
                      ) : (
                        <Text style={[styles.numpadText, { color: colors.fg }]}>
                          {k}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )
                )}
              </View>

              {/* Note Selector */}
              <View style={styles.noteContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setNoteOpen(!noteOpen)}
                  style={[
                    styles.noteButton,
                    {
                      backgroundColor: colors.raised,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <IconNote size={13} color={colors.fg3} />
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
                      styles.noteDropdownList,
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
                          styles.noteDropdownItem,
                          {
                            borderBottomColor: colors.border,
                            borderBottomWidth:
                              idx < noteOptions.length - 1 ? 1 : 0,
                          },
                        ]}
                      >
                        <Text style={[styles.noteDropdownText, { color: colors.fg }]}>
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
                onPress={canSend ? () => setStep('sent') : undefined}
                style={[
                  styles.submitBtn,
                  {
                    backgroundColor: canSend ? colors.accent : colors.raised,
                    borderColor: canSend ? 'transparent' : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.submitBtnText,
                    { color: canSend ? colors.accentFg : colors.fg3 },
                  ]}
                >
                  {canSend
                    ? `Request $${parseFloat(amount).toFixed(2)}`
                    : 'Select Contact & Amount'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
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
    maxHeight: '92%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  sheetScroll: {
    paddingHorizontal: 24,
  },
  sheetScrollContent: {
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
  },
  composeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  composeTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  composeSubtitle: {
    fontSize: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactSection: {
    marginBottom: 16,
  },
  selectedContactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
  },
  contactAvatar: {
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
  contactName: {
    fontSize: 14,
    fontWeight: '800',
  },
  contactSub: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  removeContactBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  searchContactInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionsBox: {
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 8,
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  suggestionAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionAvatarText: {
    fontSize: 11,
    fontWeight: '900',
  },
  suggestionNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  suggestionName: {
    fontSize: 13,
    fontWeight: '700',
  },
  suggestionSub: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  amountDisplayBlock: {
    alignItems: 'center',
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  amountTextRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  amountDollarSymbol: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
    marginRight: 2,
  },
  amountNumber: {
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: -1.5,
    lineHeight: 58,
  },
  amountEthApprox: {
    fontSize: 12,
    marginTop: 2,
  },
  numpadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    maxWidth: 300,
    alignSelf: 'center',
    marginBottom: 16,
  },
  numpadKey: {
    width: '31%',
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numpadKeyNum: {
    borderWidth: 1,
  },
  numpadKeyBack: {
    backgroundColor: 'transparent',
  },
  numpadText: {
    fontSize: 18,
    fontWeight: '800',
  },
  noteContainer: {
    position: 'relative',
    marginBottom: 20,
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
  noteDropdownList: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 10,
  },
  noteDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  noteDropdownText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '900',
  },
  sentContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
  },
  sentIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  sentHeaderLabel: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  sentAmount: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 6,
  },
  sentTarget: {
    fontSize: 14,
    marginBottom: 4,
  },
  sentNote: {
    fontSize: 12,
    marginBottom: 24,
  },
  pendingCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 20,
  },
  pendingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sentDoneBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  sentDoneBtnText: {
    fontSize: 16,
    fontWeight: '900',
  },
})
