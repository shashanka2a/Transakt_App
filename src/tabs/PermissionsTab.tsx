import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native'
import Svg, { Path, Rect, Circle } from 'react-native-svg'
import { useTheme } from '../ThemeContext'

interface SubAccount {
  id: string
  name: string
  ens: string
  role: string
  eth: string
  fiat: string
  badge: 'ACTIVE' | 'LOCKED' | 'AUTO'
  hex: string
  badgeBg: string
  badgeBorder: string
  initials: string
  avatarHue: string
}

const SEED_ACCOUNTS: SubAccount[] = [
  {
    id: 'daily',
    name: 'Daily Pocket',
    ens: 'pay.smithfam.eth',
    role: 'Alex · Teen',
    eth: '0.12 ETH',
    fiat: '$342.80',
    badge: 'ACTIVE',
    hex: '#1DB563',
    badgeBg: 'rgba(29,181,99,0.12)',
    badgeBorder: 'rgba(29,181,99,0.28)',
    initials: 'AX',
    avatarHue: '150',
  },
  {
    id: 'savings',
    name: 'Savings',
    ens: 'vault.smithfam.eth',
    role: 'Parent Controlled',
    eth: '1.20 ETH',
    fiat: '$3,428.00',
    badge: 'LOCKED',
    hex: '#D4900A',
    badgeBg: 'rgba(212,144,10,0.12)',
    badgeBorder: 'rgba(212,144,10,0.28)',
    initials: 'SM',
    avatarHue: '38',
  },
  {
    id: 'allowance',
    name: 'Allowance',
    ens: 'allow.smithfam.eth',
    role: 'Auto-refill · Monthly',
    eth: '0.04 ETH',
    fiat: '$114.27',
    badge: 'AUTO',
    hex: '#7D8494',
    badgeBg: 'rgba(125,132,148,0.12)',
    badgeBorder: 'rgba(125,132,148,0.26)',
    initials: 'AL',
    avatarHue: '220',
  },
]

const hues = ['150', '200', '280', '30', '0', '320']
const randomHue = () => hues[Math.floor(Math.random() * hues.length)]

export default function PermissionsTab() {
  const { colors } = useTheme()
  const [accounts, setAccounts] = useState<SubAccount[]>(SEED_ACCOUNTS)
  const [showIssue, setShowIssue] = useState(false)

  const handleMinted = (name: string) => {
    const initials = name.slice(0, 2).toUpperCase()
    const hue = randomHue()
    const newAcc: SubAccount = {
      id: name,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      ens: `${name}.smithfam.eth`,
      role: 'New Member',
      eth: '0.00 ETH',
      fiat: '$0.00',
      badge: 'ACTIVE',
      hex: '#1DB563',
      badgeBg: 'rgba(29,181,99,0.12)',
      badgeBorder: 'rgba(29,181,99,0.28)',
      initials,
      avatarHue: hue,
    }
    setAccounts((prev) => [...prev, newAcc])
    setShowIssue(false)
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.fg }]}>
              Manage
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.fg3 }]}>
              smithfam.eth
            </Text>
          </View>
          <View
            style={[
              styles.ensTag,
              {
                backgroundColor: 'rgba(29,181,99,0.10)',
                borderColor: 'rgba(29,181,99,0.22)',
              },
            ]}
          >
            <View style={styles.pulseDot} />
            <Text style={styles.ensTagText}>ENSv2</Text>
          </View>
        </View>

        <Text style={[styles.sectionHeading, { color: colors.fg3 }]}>
          Nodes &amp; Sub-accounts
        </Text>

        {/* Nodes List */}
        <View style={styles.nodesList}>
          {accounts.map((acc) => (
            <View
              key={acc.id}
              style={[
                styles.accountRow,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              {/* Left Accent Strip */}
              <View
                style={[styles.leftAccentStrip, { backgroundColor: acc.hex }]}
              />

              <View
                style={[
                  styles.avatarBox,
                  {
                    backgroundColor: `hsl(${acc.avatarHue}, 35%, 88%)`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.avatarText,
                    { color: `hsl(${acc.avatarHue}, 45%, 28%)` },
                  ]}
                >
                  {acc.initials}
                </Text>
              </View>

              <View style={styles.accountInfo}>
                <View style={styles.accountNameRow}>
                  <Text style={[styles.accountName, { color: colors.fg }]}>
                    {acc.name}
                  </Text>
                  <View
                    style={[
                      styles.accountBadge,
                      {
                        backgroundColor: acc.badgeBg,
                        borderColor: acc.badgeBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.accountBadgeText, { color: acc.hex }]}
                    >
                      {acc.badge}
                    </Text>
                  </View>
                </View>
                <Text
                  numberOfLines={1}
                  style={[styles.accountEns, { color: colors.fg3 }]}
                >
                  {acc.ens}
                </Text>
                <Text style={[styles.accountRole, { color: colors.fg2 }]}>
                  {acc.role}
                </Text>
              </View>

              <View style={styles.accountBalances}>
                <Text style={[styles.accountEth, { color: colors.fg }]}>
                  {acc.eth}
                </Text>
                <Text style={[styles.accountFiat, { color: colors.fg3 }]}>
                  {acc.fiat}
                </Text>
              </View>
            </View>
          ))}

          {/* Issue CTA */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowIssue(true)}
            style={[
              styles.issueCtaRow,
              {
                borderColor: colors.border2,
              },
            ]}
          >
            <View
              style={[
                styles.issueIconCircle,
                {
                  backgroundColor: colors.raised,
                  borderColor: colors.border2,
                },
              ]}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 5v14M5 12h14"
                  stroke={colors.fg3}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
            </View>
            <View style={styles.issueTexts}>
              <Text style={[styles.issueCtaTitle, { color: colors.fg }]}>
                Issue New Subname
              </Text>
              <Text style={[styles.issueCtaSub, { color: colors.fg3 }]}>
                Add a family member to your node
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showIssue && (
        <IssueSubnameWizardSheet
          onClose={() => setShowIssue(false)}
          onMinted={handleMinted}
        />
      )}
    </View>
  )
}

/* ══════════════════════════════════════════════════════════════
   Issue Subname Wizard Sheet (Tutorial -> Form -> Minting -> Done)
══════════════════════════════════════════════════════════════ */
type SheetStep = 'tutorial' | 'form' | 'minting' | 'success'

interface PermItem {
  id: string
  label: string
  sub: string
  type: 'toggle' | 'value'
  value: boolean | string
  locked?: boolean
}

const DEFAULT_PERMS: PermItem[] = [
  {
    id: 'profile',
    label: 'Edit Profile & Avatar',
    sub: 'Change display name & photo',
    type: 'toggle',
    value: true,
  },
  {
    id: 'send_limit',
    label: 'Send Limit per Tx',
    sub: 'Max single transaction amount',
    type: 'value',
    value: '$50.00 USDC',
  },
  {
    id: 'payout',
    label: 'Modify Payout Address',
    sub: 'Change withdrawal destination',
    type: 'toggle',
    value: false,
    locked: true,
  },
]

function IssueSubnameWizardSheet({
  onClose,
  onMinted,
}: {
  onClose: () => void
  onMinted: (name: string) => void
}) {
  const { colors } = useTheme()
  const [step, setStep] = useState<SheetStep>('tutorial')
  const [name, setName] = useState('')
  const [perms, setPerms] = useState<PermItem[]>(DEFAULT_PERMS)
  const [editId, setEditId] = useState<string | null>(null)
  const [editVal, setEditVal] = useState('')

  const handleMint = () => {
    setStep('minting')
    setTimeout(() => {
      setStep('success')
      setTimeout(() => onMinted(name), 2200)
    }, 1800)
  }

  const togglePerm = (id: string) =>
    setPerms((p) =>
      p.map((r) =>
        r.id === id && !r.locked ? { ...r, value: !r.value } : r
      )
    )

  const STEPS = ['Subname', 'Permissions', 'Invite']
  const stepIdx =
    step === 'tutorial'
      ? -1
      : step === 'form'
      ? 0
      : step === 'minting'
      ? 2
      : 3

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={step === 'tutorial' || step === 'form' ? onClose : undefined}
        />

        <View
          style={[
            styles.sheetModalBox,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
            },
          ]}
        >
          {/* Handle */}
          <View style={[styles.sheetHandle, { backgroundColor: colors.border2 }]} />

          {/* Stepper Header */}
          {step !== 'tutorial' && step !== 'success' && (
            <View style={styles.stepperContainer}>
              {STEPS.map((s, i) => (
                <View key={s} style={styles.stepperItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      {
                        backgroundColor:
                          i <= stepIdx ? colors.accent : colors.raised,
                        borderColor:
                          i <= stepIdx ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepNum,
                        {
                          color:
                            i <= stepIdx ? colors.accentFg : colors.fg3,
                        },
                      ]}
                    >
                      {i < stepIdx ? '✓' : i + 1}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.stepText,
                      {
                        color: i <= stepIdx ? colors.fg : colors.fg3,
                      },
                    ]}
                  >
                    {s}
                  </Text>
                  {i < STEPS.length - 1 && (
                    <View
                      style={[
                        styles.stepConnector,
                        {
                          backgroundColor:
                            i < stepIdx ? colors.accent : colors.border,
                        },
                      ]}
                    />
                  )}
                </View>
              ))}
            </View>
          )}

          <ScrollView
            style={styles.sheetScroll}
            contentContainerStyle={styles.sheetScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ── TUTORIAL STEP ── */}
            {step === 'tutorial' && (
              <View>
                <View style={styles.wizardHeader}>
                  <View>
                    <Text style={[styles.wizardTitle, { color: colors.fg }]}>
                      Add a Family Member
                    </Text>
                    <Text
                      style={[
                        styles.wizardEns,
                        { color: colors.accent },
                      ]}
                    >
                      smithfam.eth
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={onClose}
                    style={[
                      styles.wizardCloseBtn,
                      {
                        backgroundColor: colors.raised,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M18 6L6 18M6 6l12 12"
                        stroke={colors.fg2}
                        strokeWidth={2}
                        strokeLinecap="round"
                      />
                    </Svg>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.tutorialDescription, { color: colors.fg2 }]}>
                  A <Text style={{ fontWeight: '800', color: colors.fg }}>subname</Text> is a delegated ENS identity under your family root. Each member gets their own onchain address — no seed phrase, no bank account needed.
                </Text>

                {/* Example preview card */}
                <View
                  style={[
                    styles.exampleCard,
                    {
                      backgroundColor: colors.raised,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.exampleTagRow,
                      {
                        borderBottomColor: colors.border,
                        backgroundColor: colors.bg,
                      },
                    ]}
                  >
                    <View style={[styles.exampleDot, { backgroundColor: colors.accent }]} />
                    <Text style={[styles.exampleTagText, { color: colors.fg3 }]}>
                      Example
                    </Text>
                  </View>
                  <View style={styles.exampleContent}>
                    <View style={styles.exampleMemberRow}>
                      <View style={styles.exampleAvatar}>
                        <Text style={styles.exampleAvatarText}>AL</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.exampleName, { color: colors.fg }]}>
                          alex
                        </Text>
                        <Text style={[styles.exampleEns, { color: colors.accent }]}>
                          alex.smithfam.eth
                        </Text>
                      </View>
                      <View style={styles.exampleBadge}>
                        <Text style={styles.exampleBadgeText}>ACTIVE</Text>
                      </View>
                    </View>

                    <View style={styles.exampleChipsRow}>
                      {['Send $50 / tx', 'Edit profile', 'ENS resolved'].map((chip) => (
                        <View
                          key={chip}
                          style={[
                            styles.exampleChip,
                            {
                              backgroundColor: colors.surface,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <Text style={[styles.exampleChipText, { color: colors.fg2 }]}>
                            {chip}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>

                {/* 3 Step Explanation */}
                <Text style={[styles.howItWorksTitle, { color: colors.fg3 }]}>
                  How it works
                </Text>
                <View style={styles.howItWorksList}>
                  {[
                    {
                      n: '1',
                      title: 'Choose a subname',
                      body: 'Pick a name like "alex" — it becomes alex.smithfam.eth onchain.',
                    },
                    {
                      n: '2',
                      title: 'Set permissions',
                      body: 'Control spend limits, profile editing, and payout address access.',
                    },
                    {
                      n: '3',
                      title: 'Send invite link',
                      body: 'They activate their wallet via biometric selfie. No seed phrase.',
                    },
                  ].map((item) => (
                    <View
                      key={item.n}
                      style={[
                        styles.howItWorksCard,
                        {
                          backgroundColor: colors.raised,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.howItWorksNum,
                          {
                            backgroundColor: colors.accent,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.howItWorksNumText,
                            { color: colors.accentFg },
                          ]}
                        >
                          {item.n}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.howItWorksItemTitle, { color: colors.fg }]}>
                          {item.title}
                        </Text>
                        <Text style={[styles.howItWorksItemBody, { color: colors.fg2 }]}>
                          {item.body}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setStep('form')}
                  style={[
                    styles.wizardCtaButton,
                    { backgroundColor: colors.accent },
                  ]}
                >
                  <Text style={[styles.wizardCtaText, { color: colors.accentFg }]}>
                    Get Started
                  </Text>
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke={colors.accentFg}
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </TouchableOpacity>
              </View>
            )}

            {/* ── FORM STEP ── */}
            {step === 'form' && (
              <View>
                <View style={styles.wizardHeader}>
                  <View>
                    <Text style={[styles.wizardTitle, { color: colors.fg }]}>
                      Issue Subname
                    </Text>
                    <Text style={[styles.wizardEns, { color: colors.accent }]}>
                      smithfam.eth
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={onClose}
                    style={[
                      styles.wizardCloseBtn,
                      {
                        backgroundColor: colors.raised,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M18 6L6 18M6 6l12 12"
                        stroke={colors.fg2}
                        strokeWidth={2}
                        strokeLinecap="round"
                      />
                    </Svg>
                  </TouchableOpacity>
                </View>

                {/* Subname Input */}
                <Text style={[styles.howItWorksTitle, { color: colors.fg3 }]}>
                  Subname
                </Text>
                <View
                  style={[
                    styles.subnameFormInputRow,
                    {
                      backgroundColor: colors.raised,
                      borderColor: name ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <TextInput
                    value={name}
                    onChangeText={(text) =>
                      setName(text.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                    }
                    placeholder="alex"
                    placeholderTextColor={colors.fg3}
                    autoCapitalize="none"
                    style={[styles.subnameFormInput, { color: colors.fg }]}
                  />
                  <Text style={[styles.subnameSuffixText, { color: colors.fg3 }]}>
                    .smithfam.eth
                  </Text>
                </View>
                {name.length > 0 && (
                  <Text style={[styles.subnamePreview, { color: colors.accent }]}>
                    ✓ {name}.smithfam.eth
                  </Text>
                )}

                {/* Permissions List */}
                <Text style={[styles.howItWorksTitle, { color: colors.fg3, marginTop: 16 }]}>
                  Permissions
                </Text>
                <View
                  style={[
                    styles.permsContainer,
                    {
                      backgroundColor: colors.raised,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  {perms.map((perm, i) => (
                    <View
                      key={perm.id}
                      style={[
                        styles.permItemRow,
                        {
                          borderBottomColor: colors.border,
                          borderBottomWidth: i < perms.length - 1 ? 1 : 0,
                          opacity: perm.locked ? 0.6 : 1,
                        },
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <View style={styles.permLabelHeader}>
                          <Text style={[styles.permItemTitle, { color: colors.fg }]}>
                            {perm.label}
                          </Text>
                          {perm.locked && (
                            <View style={styles.lockedTag}>
                              <Svg width={8} height={8} viewBox="0 0 24 24" fill="none">
                                <Rect x="3" y="11" width="18" height="11" rx="2" stroke="#FF4757" strokeWidth={2} />
                                <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#FF4757" strokeWidth={2} strokeLinecap="round" />
                              </Svg>
                              <Text style={styles.lockedTagText}>Locked</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.permItemSub, { color: colors.fg2 }]}>
                          {perm.sub}
                        </Text>
                      </View>

                      {perm.type === 'toggle' && (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          disabled={perm.locked}
                          onPress={() => togglePerm(perm.id)}
                          style={[
                            styles.toggleTrack,
                            {
                              backgroundColor: perm.value ? colors.accent : colors.border2,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.toggleThumb,
                              {
                                alignSelf: perm.value ? 'flex-end' : 'flex-start',
                                backgroundColor: perm.value ? colors.accentFg : colors.fg3,
                              },
                            ]}
                          />
                        </TouchableOpacity>
                      )}

                      {perm.type === 'value' && !perm.locked && (
                        <TouchableOpacity
                          activeOpacity={0.7}
                          style={[
                            styles.valueEditPill,
                            {
                              backgroundColor: colors.surface,
                              borderColor: colors.border2,
                            },
                          ]}
                        >
                          <Text style={[styles.valueEditText, { color: colors.fg }]}>
                            {perm.value as string}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>

                {/* Info strip */}
                <View
                  style={[
                    styles.infoBox,
                    {
                      backgroundColor: colors.raised,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="10" stroke={colors.fg3} strokeWidth={1.6} />
                    <Path d="M12 8v4M12 16h.01" stroke={colors.fg3} strokeWidth={1.6} strokeLinecap="round" />
                  </Svg>
                  <Text style={[styles.infoBoxText, { color: colors.fg2 }]}>
                    An invite link will be generated. The new member activates their account via biometric selfie — no seed phrase required.
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={!name.trim()}
                  onPress={handleMint}
                  style={[
                    styles.wizardCtaButton,
                    {
                      backgroundColor: name.trim() ? colors.accent : colors.raised,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.wizardCtaText,
                      { color: name.trim() ? colors.accentFg : colors.fg3 },
                    ]}
                  >
                    Mint Subname &amp; Send Invite Link
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── MINTING STEP ── */}
            {step === 'minting' && (
              <View style={styles.mintingCenter}>
                <View
                  style={[
                    styles.mintingIconCircle,
                    {
                      backgroundColor: colors.mt10,
                      borderColor: colors.mb20,
                    },
                  ]}
                >
                  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M12 2L4 6V12C4 16.42 7.58 20.17 12 21C16.42 20.17 20 16.42 20 12V6L12 2Z"
                      stroke={colors.accent}
                      strokeWidth={1.8}
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <ActivityIndicator size="large" color={colors.accent} style={{ marginVertical: 12 }} />
                <Text style={[styles.mintingTitle, { color: colors.fg }]}>
                  Minting subname…
                </Text>
                <Text style={[styles.mintingEns, { color: colors.accent }]}>
                  {name}.smithfam.eth
                </Text>
                <Text style={[styles.mintingNote, { color: colors.fg3 }]}>
                  Writing to ENSv2 registry · Generating invite link
                </Text>
              </View>
            )}

            {/* ── SUCCESS STEP ── */}
            {step === 'success' && (
              <View style={styles.mintingCenter}>
                <View
                  style={[
                    styles.successOuterCircle,
                    {
                      backgroundColor: colors.mt10,
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

                <Text style={[styles.mintingTitle, { color: colors.fg }]}>
                  Subname Created!
                </Text>
                <Text style={[styles.mintingEns, { color: colors.accent }]}>
                  {name}.smithfam.eth
                </Text>

                <View
                  style={[
                    styles.copiedLinkPill,
                    {
                      backgroundColor: colors.raised,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.copiedLinkText, { color: colors.fg2 }]}>
                    Invite link copied to clipboard
                  </Text>
                </View>
                <Text style={[styles.mintingNote, { color: colors.fg3 }]}>
                  Opening your dashboard…
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 2,
  },
  ensTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1DB563',
  },
  ensTagText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: '#1DB563',
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  nodesList: {
    gap: 12,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  leftAccentStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  avatarBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '900',
  },
  accountInfo: {
    flex: 1,
  },
  accountNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '800',
  },
  accountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  accountBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  accountEns: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  accountRole: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  accountBalances: {
    alignItems: 'flex-end',
  },
  accountEth: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  accountFiat: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  issueCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  issueIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  issueTexts: {
    flex: 1,
  },
  issueCtaTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  issueCtaSub: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetModalBox: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
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
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  stepperItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    fontSize: 9,
    fontWeight: '900',
  },
  stepText: {
    fontSize: 10,
    fontWeight: '700',
  },
  stepConnector: {
    width: 18,
    height: 1,
    marginLeft: 4,
  },
  sheetScroll: {
    paddingHorizontal: 24,
  },
  sheetScrollContent: {
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
  },
  wizardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  wizardTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  wizardEns: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '700',
    marginTop: 2,
  },
  wizardCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tutorialDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  exampleCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  exampleTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  exampleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  exampleTagText: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  exampleContent: {
    padding: 14,
  },
  exampleMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  exampleAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'hsl(150, 35%, 88%)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exampleAvatarText: {
    fontSize: 14,
    fontWeight: '900',
    color: 'hsl(150, 45%, 28%)',
  },
  exampleName: {
    fontSize: 15,
    fontWeight: '800',
  },
  exampleEns: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '600',
  },
  exampleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(29,181,99,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(29,181,99,0.28)',
  },
  exampleBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#1DB563',
  },
  exampleChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  exampleChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  exampleChipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  howItWorksTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  howItWorksList: {
    gap: 8,
    marginBottom: 20,
  },
  howItWorksCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  howItWorksNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  howItWorksNumText: {
    fontSize: 11,
    fontWeight: '900',
  },
  howItWorksItemTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  howItWorksItemBody: {
    fontSize: 12,
    lineHeight: 16,
  },
  wizardCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 28,
    marginTop: 8,
  },
  wizardCtaText: {
    fontSize: 15,
    fontWeight: '900',
  },
  subnameFormInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 4,
  },
  subnameFormInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
  },
  subnameSuffixText: {
    fontSize: 14,
    fontWeight: '700',
  },
  subnamePreview: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '600',
    marginLeft: 4,
    marginBottom: 12,
  },
  permsContainer: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  permItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    gap: 10,
  },
  permLabelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  permItemTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  lockedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(255,71,87,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,71,87,0.22)',
  },
  lockedTagText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FF4757',
    textTransform: 'uppercase',
  },
  permItemSub: {
    fontSize: 11,
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  valueEditPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  valueEditText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },
  mintingCenter: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  mintingIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mintingTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  mintingEns: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '700',
    marginBottom: 8,
  },
  mintingNote: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 12,
  },
  successOuterCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  copiedLinkPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
  },
  copiedLinkText: {
    fontSize: 12,
    fontWeight: '600',
  },
})
