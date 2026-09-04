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

interface Props {
  onClose: () => void
}

interface Perm {
  id: string
  label: string
  sub: string
  type: 'toggle' | 'value'
  value: boolean | string
  locked?: boolean
}

const initPerms: Perm[] = [
  {
    id: 'profile',
    label: 'Edit Profile & Avatar',
    sub: 'Change display name & photo',
    type: 'toggle',
    value: true,
  },
  {
    id: 'limit',
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

type Step = 'compose' | 'minting' | 'done'

export default function IssueSubnameModal({ onClose }: Props) {
  const { colors } = useTheme()
  const [subname, setSubname] = useState('')
  const [perms, setPerms] = useState<Perm[]>(initPerms)
  const [editId, setEditId] = useState<string | null>(null)
  const [editVal, setEditVal] = useState('')
  const [step, setStep] = useState<Step>('compose')

  const toggle = (id: string) => {
    setPerms((prev) =>
      prev.map((r) =>
        r.id === id && !r.locked ? { ...r, value: !r.value } : r
      )
    )
  }

  const mint = () => {
    if (!subname.trim()) return
    setStep('minting')
    setTimeout(() => setStep('done'), 1800)
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={step === 'done' ? onClose : undefined}
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

          {step === 'done' ? (
            /* Success State */
            <View style={styles.successBlock}>
              <View
                style={[
                  styles.successCheckCircle,
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

              <Text style={[styles.successSubtitle, { color: colors.fg2 }]}>
                Subname Minted
              </Text>
              <Text style={[styles.successName, { color: colors.fg }]}>
                {subname}.smithfam.eth
              </Text>
              <Text style={[styles.successDesc, { color: colors.fg2 }]}>
                An invite link has been sent. The new member can activate their account using biometrics.
              </Text>

              <View
                style={[
                  styles.inviteLinkCard,
                  {
                    backgroundColor: colors.raised,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inviteLabel, { color: colors.fg3 }]}>
                    Invite Link
                  </Text>
                  <Text style={[styles.inviteUrl, { color: colors.accent }]}>
                    safefam.app/join/{subname}
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[
                    styles.copyPill,
                    {
                      backgroundColor: colors.mt10,
                      borderColor: colors.mb20,
                    },
                  ]}
                >
                  <Text style={[styles.copyText, { color: colors.accent }]}>Copy</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onClose}
                style={[styles.doneButton, { backgroundColor: colors.accent }]}
              >
                <Text style={[styles.doneButtonText, { color: colors.accentFg }]}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Compose / Minting State */
            <ScrollView
              style={styles.sheetScroll}
              contentContainerStyle={styles.sheetContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Sheet Header */}
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={[styles.sheetTitle, { color: colors.fg }]}>
                    Issue Subname
                  </Text>
                  <Text style={[styles.sheetSubdomain, { color: colors.accent }]}>
                    smithfam.eth
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onClose}
                  style={[
                    styles.closeButton,
                    {
                      backgroundColor: colors.raised,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M18 6L6 18M6 6L18 18"
                      stroke={colors.fg2}
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  </Svg>
                </TouchableOpacity>
              </View>

              {/* Subname input */}
              <View style={styles.inputSection}>
                <Text style={[styles.inputLabel, { color: colors.fg3 }]}>
                  Subname
                </Text>
                <View
                  style={[
                    styles.subnameInputRow,
                    {
                      backgroundColor: colors.raised,
                      borderColor: subname ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <TextInput
                    value={subname}
                    onChangeText={(text) =>
                      setSubname(text.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                    }
                    placeholder="alex"
                    placeholderTextColor={colors.fg3}
                    autoCapitalize="none"
                    style={[styles.subnameTextInput, { color: colors.fg }]}
                  />
                  <Text style={[styles.subnameSuffix, { color: colors.fg3 }]}>
                    .smithfam.eth
                  </Text>
                </View>
                {subname.length > 0 && (
                  <Text style={[styles.subnameSuccessPreview, { color: colors.accent }]}>
                    ✓ {subname}.smithfam.eth looks good
                  </Text>
                )}
              </View>

              {/* Permissions list */}
              <View style={styles.permsSection}>
                <Text style={[styles.inputLabel, { color: colors.fg3 }]}>
                  Permissions
                </Text>
                <View
                  style={[
                    styles.permsCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  {perms.map((perm, i) => (
                    <View
                      key={perm.id}
                      style={[
                        styles.permRow,
                        {
                          borderBottomColor: colors.border,
                          borderBottomWidth: i < perms.length - 1 ? 1 : 0,
                          opacity: perm.locked ? 0.6 : 1,
                        },
                      ]}
                    >
                      <View style={styles.permTextContainer}>
                        <View style={styles.permLabelRow}>
                          <Text
                            style={[
                              styles.permLabel,
                              { color: perm.locked ? colors.fg2 : colors.fg },
                            ]}
                          >
                            {perm.label}
                          </Text>
                          {perm.locked && (
                            <View
                              style={[
                                styles.lockedPill,
                                {
                                  backgroundColor: colors.dt5,
                                  borderColor: colors.db25,
                                },
                              ]}
                            >
                              <Svg width={8} height={8} viewBox="0 0 24 24" fill="none">
                                <Rect x="3" y="11" width="18" height="11" rx="2" stroke="#FF4757" strokeWidth={2} />
                                <Path d="M7 11V7C7 4.24 9.24 2 12 2C14.76 2 17 4.24 17 7V11" stroke="#FF4757" strokeWidth={2} strokeLinecap="round" />
                              </Svg>
                              <Text style={styles.lockedText}>Locked</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.permSub, { color: colors.fg3 }]}>
                          {perm.sub}
                        </Text>
                      </View>

                      {/* Controls */}
                      <View>
                        {perm.type === 'toggle' && (
                          <TouchableOpacity
                            activeOpacity={0.8}
                            disabled={perm.locked}
                            onPress={() => toggle(perm.id)}
                            style={[
                              styles.switchTrack,
                              {
                                backgroundColor: perm.value ? colors.accent : colors.raised,
                                borderColor: perm.value ? colors.accent : colors.border,
                              },
                            ]}
                          >
                            <View
                              style={[
                                styles.switchThumb,
                                {
                                  alignSelf: perm.value ? 'flex-end' : 'flex-start',
                                  backgroundColor: perm.value ? colors.accentFg : colors.fg3,
                                },
                              ]}
                            />
                          </TouchableOpacity>
                        )}

                        {perm.type === 'value' &&
                          (editId === perm.id ? (
                            <View style={styles.inlineEditRow}>
                              <TextInput
                                autoFocus
                                value={editVal}
                                onChangeText={setEditVal}
                                onSubmitEditing={() => {
                                  setPerms((p) =>
                                    p.map((r) =>
                                      r.id === perm.id ? { ...r, value: editVal } : r
                                    )
                                  )
                                  setEditId(null)
                                }}
                                style={[
                                  styles.inlineEditInput,
                                  {
                                    backgroundColor: colors.raised,
                                    borderColor: colors.accent,
                                    color: colors.fg,
                                  },
                                ]}
                              />
                              <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => {
                                  setPerms((p) =>
                                    p.map((r) =>
                                      r.id === perm.id ? { ...r, value: editVal } : r
                                    )
                                  )
                                  setEditId(null)
                                }}
                                style={[
                                  styles.inlineSaveBtn,
                                  { backgroundColor: colors.accent },
                                ]}
                              >
                                <Svg width={10} height={10} viewBox="0 0 12 12" fill="none">
                                  <Path
                                    d="M2 6L4.5 8.5L10 3"
                                    stroke={colors.accentFg}
                                    strokeWidth={1.8}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </Svg>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <TouchableOpacity
                              activeOpacity={0.7}
                              onPress={() => {
                                setEditId(perm.id)
                                setEditVal(perm.value as string)
                              }}
                              style={[
                                styles.valuePill,
                                {
                                  backgroundColor: colors.raised,
                                  borderColor: colors.border2,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.valuePillText,
                                  { color: colors.fg },
                                ]}
                              >
                                {perm.value as string}
                              </Text>
                              <Svg width={9} height={9} viewBox="0 0 24 24" fill="none">
                                <Path
                                  d="M11 4H4C3.45 4 3 4.45 3 5V20C3 20.55 3.45 21 4 21H19C19.55 21 20 20.55 20 20V13M18.59 2.59C19.37 1.81 20.63 1.81 21.41 2.59C22.19 3.37 22.19 4.63 21.41 5.41L12 15L8 16L9 12L18.59 2.59Z"
                                  stroke={colors.fg3}
                                  strokeWidth={1.8}
                                  strokeLinecap="round"
                                />
                              </Svg>
                            </TouchableOpacity>
                          ))}
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Info strip */}
              <View
                style={[
                  styles.infoStrip,
                  {
                    backgroundColor: colors.mt6,
                    borderColor: colors.mb20,
                  },
                ]}
              >
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="12" r="10" stroke={colors.accent} strokeWidth={1.6} />
                  <Path d="M12 8v4M12 16h.01" stroke={colors.accent} strokeWidth={1.6} strokeLinecap="round" />
                </Svg>
                <Text style={[styles.infoStripText, { color: colors.fg2 }]}>
                  An invite link will be generated. The new member activates their account via biometric selfie — no seed phrase required.
                </Text>
              </View>

              {/* Mint CTA */}
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={!subname.trim() || step === 'minting'}
                onPress={mint}
                style={[
                  styles.mintButton,
                  {
                    backgroundColor: subname.trim() ? colors.accent : colors.raised,
                    borderColor: subname.trim() ? 'transparent' : colors.border,
                  },
                ]}
              >
                {step === 'minting' ? (
                  <View style={styles.mintingRow}>
                    <ActivityIndicator size="small" color={colors.accentFg} />
                    <Text style={[styles.mintButtonText, { color: colors.accentFg }]}>
                      Minting on ENSv2…
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.mintButtonText,
                      { color: subname.trim() ? colors.accentFg : colors.fg3 },
                    ]}
                  >
                    Mint Subname & Send Invite Link
                  </Text>
                )}
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
    marginBottom: 8,
  },
  sheetScroll: {
    paddingHorizontal: 24,
  },
  sheetContent: {
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  sheetSubdomain: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '700',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  subnameInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    height: 56,
  },
  subnameTextInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '900',
  },
  subnameSuffix: {
    fontSize: 15,
    fontWeight: '700',
  },
  subnameSuccessPreview: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '600',
    marginTop: 6,
    marginLeft: 4,
  },
  permsSection: {
    marginBottom: 20,
  },
  permsCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  permTextContainer: {
    flex: 1,
  },
  permLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  permLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  lockedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  lockedText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FF4757',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  permSub: {
    fontSize: 12,
  },
  switchTrack: {
    width: 48,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    padding: 2,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  inlineEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inlineEditInput: {
    width: 90,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },
  inlineSaveBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valuePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  valuePillText: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  infoStrip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  infoStripText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  mintButton: {
    paddingVertical: 16,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mintingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mintButtonText: {
    fontSize: 15,
    fontWeight: '900',
  },
  successBlock: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: Platform.OS === 'ios' ? 48 : 28,
  },
  successCheckCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successSubtitle: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  successName: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  successDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  inviteLinkCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 24,
  },
  inviteLabel: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  inviteUrl: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  copyPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  copyText: {
    fontSize: 11,
    fontWeight: '800',
  },
  doneButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '900',
  },
})
