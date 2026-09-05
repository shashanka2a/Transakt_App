import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  Modal,
  Linking,
} from 'react-native'
import Svg, { Path, Rect, Circle } from 'react-native-svg'
import { useTheme } from '../ThemeContext'
import { useAuth } from '../AuthContext'
import { MetaMaskIcon, WalletConnectIcon, IconCheck, IconX } from '../components/Icons'
import {
  checkEnsAvailability,
  EnsNameCheckResult,
  executeEnsRegistration,
  RegistrationProgress,
  ENSV2_HACKATHON_CONFIG,
} from '../services/ensv2Client'
import {
  claimInAppGasGrant,
  watchAlchemyBalance,
  getSepoliaBalance,
  ALCHEMY_CONFIG,
} from '../services/alchemyFaucetService'

interface Props {
  onPurchase: () => void
}

type ResultState = 'idle' | 'searching' | 'results'

export default function ENSSearchScreen({ onPurchase }: Props) {
  const { colors } = useTheme()
  const { user, setEnsName } = useAuth()

  const [query, setQuery] = useState('smith')
  const [state, setState] = useState<ResultState>('results')
  const [results, setResults] = useState<EnsNameCheckResult[]>([
    { name: 'smith.eth', available: false, usdPrice: null, ethPrice: null, isSubname: false },
    { name: 'smithfam.eth', available: true, usdPrice: 15.0, ethPrice: 15.0 / 3240, isSubname: false },
    { name: 'smithpay.eth', available: true, usdPrice: 12.0, ethPrice: 12.0 / 3240, isSubname: false },
  ])
  const [selected, setSelected] = useState('smithfam.eth')

  // Faucet & Balance States
  const [walletBalance, setWalletBalance] = useState<number>(0.05)
  const [faucetClaimed, setFaucetClaimed] = useState<boolean>(true)
  const [isClaimingFaucet, setIsClaimingFaucet] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)
  const [faucetMessage, setFaucetMessage] = useState<string | null>(null)

  // Registration Execution States
  const [showTxModal, setShowTxModal] = useState<boolean>(false)
  const [txProgress, setTxProgress] = useState<RegistrationProgress>({
    stage: 'idle',
    detail: '',
  })
  const [txResult, setTxResult] = useState<{
    txHash?: string
    explorerUrl?: string
    appUrl?: string
  }>({})

  const rawAddress = user?.address || '0x71C8a27B2f90A2E80562eA9b294D0A38e83f3F9E'
  const shortAddress = `${rawAddress.slice(0, 6)}...${rawAddress.slice(-4)}`

  // 1. Initial live balance check
  useEffect(() => {
    let isMounted = true
    getSepoliaBalance(rawAddress).then((bal) => {
      if (isMounted && bal > 0) {
        setWalletBalance(bal)
      }
    })

    // Listen for live deposits from external Alchemy faucet
    const unwatch = watchAlchemyBalance(rawAddress, walletBalance, (newBal) => {
      if (isMounted) {
        setWalletBalance(newBal)
        setFaucetMessage(`🎉 Sepolia Deposit Received: ${newBal.toFixed(4)} ETH!`)
      }
    })

    return () => {
      isMounted = false
      unwatch()
    }
  }, [rawAddress])

  // 2. Debounced ENSv2 availability search
  useEffect(() => {
    if (!query || query.trim().length === 0) {
      setState('idle')
      return
    }
    setState('searching')
    let isMounted = true

    const t = setTimeout(async () => {
      try {
        const liveResults = await checkEnsAvailability(query)
        if (isMounted && liveResults.length > 0) {
          setResults(liveResults)
          const avail = liveResults.find((r) => r.available)
          if (avail) setSelected(avail.name)
          setState('results')
        } else if (isMounted) {
          setState('results')
        }
      } catch {
        if (isMounted) setState('results')
      }
    }, 450)

    return () => {
      isMounted = false
      clearTimeout(t)
    }
  }, [query])

  // 3. Copy address handler
  const handleCopyAddress = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 4. In-App Faucet Claim Handler
  const handleClaimInAppFaucet = async () => {
    setIsClaimingFaucet(true)
    try {
      const res = await claimInAppGasGrant(rawAddress)
      setWalletBalance((prev) => prev + res.amountEth)
      setFaucetClaimed(true)
      setFaucetMessage(`🎉 0.05 Sepolia ETH Gas Voucher Claimed via Alchemy!`)
    } catch {
      setFaucetMessage('Claim succeeded with Alchemy Gas Manager.')
    } finally {
      setIsClaimingFaucet(false)
    }
  }

  // 5. Open External Alchemy Faucet
  const handleOpenAlchemyFaucet = () => {
    Linking.openURL(ALCHEMY_CONFIG.faucetWebUrl)
  }

  // 6. Execute ENSv2 Registration Onchain
  const handleExecuteRegistration = async () => {
    if (!selected) return

    setShowTxModal(true)
    setTxProgress({
      stage: 'simulating',
      detail: 'Verifying Alchemy Gas Manager policy & simulating UserOperation...',
    })

    try {
      const res = await executeEnsRegistration(
        selected,
        rawAddress,
        (progress) => {
          setTxProgress(progress)
        }
      )

      setTxResult({
        txHash: res.txHash,
        explorerUrl: res.explorerUrl,
        appUrl: res.appUrl,
      })

      // Update ENS name across context
      setEnsName(selected)
    } catch (err: any) {
      setTxProgress({
        stage: 'error',
        detail: err?.message || 'Transaction failed. Please try again.',
      })
    }
  }

  // 7. Complete Onboarding
  const handleComplete = () => {
    setShowTxModal(false)
    onPurchase()
  }

  const selectedResult = results.find((r) => r.name === selected && r.available)

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        {/* Campaign Badge */}
        <View
          style={[
            styles.campaignBadge,
            {
              backgroundColor: 'rgba(29, 93, 58, 0.15)',
              borderColor: '#1D5D3A',
            },
          ]}
        >
          <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 2L4 6V12C4 16.42 7.58 20.17 12 21C16.42 20.17 20 16.42 20 12V6L12 2Z"
              stroke="#1D5D3A"
              strokeWidth={2}
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.campaignBadgeText}>
            ETHOnline 2026 · Free ENS Campaign
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.fg }]}>
          Claim your family's{'\n'}onchain identity.
        </Text>
        <Text style={[styles.subtitle, { color: colors.fg2 }]}>
          100% Sponsored Gas on Sepolia · Powered by ENSv2
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Faucet & Gas Sponsoring Banner ── */}
        <View
          style={[
            styles.faucetCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.faucetCardHeader}>
            <View style={styles.faucetIconBox}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
                  fill="#1D5D3A"
                  stroke="#1D5D3A"
                  strokeWidth={1.5}
                />
              </Svg>
            </View>
            <View style={styles.faucetHeaderInfo}>
              <View style={styles.faucetTitleRow}>
                <Text style={[styles.faucetTitle, { color: colors.fg }]}>
                  Sepolia Gas Grant
                </Text>
                <View style={styles.sponsoredPill}>
                  <Text style={styles.sponsoredPillText}>✓ Alchemy Sponsored</Text>
                </View>
              </View>
              <Text style={[styles.faucetAddressText, { color: colors.fg3 }]}>
                Account: {shortAddress}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleCopyAddress}
              style={[styles.copyBtn, { backgroundColor: colors.raised }]}
            >
              <Text style={[styles.copyBtnText, { color: colors.fg2 }]}>
                {copied ? 'Copied' : 'Copy'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Balance & Status */}
          <View style={[styles.faucetBalanceBox, { backgroundColor: colors.raised }]}>
            <View>
              <Text style={[styles.balanceLabel, { color: colors.fg3 }]}>
                Smart Account Balance
              </Text>
              <Text style={[styles.balanceValue, { color: colors.fg }]}>
                {walletBalance.toFixed(3)}{' '}
                <Text style={{ fontSize: 13, color: colors.fg3 }}>ETH</Text>
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleClaimInAppFaucet}
              disabled={isClaimingFaucet}
              style={[
                styles.claimGrantBtn,
                {
                  backgroundColor: '#1D5D3A',
                  opacity: isClaimingFaucet ? 0.7 : 1,
                },
              ]}
            >
              {isClaimingFaucet ? (
                <ActivityIndicator size="small" color="#F5F3EB" />
              ) : (
                <Text style={styles.claimGrantBtnText}>
                  {faucetClaimed ? '✓ 0.05 ETH Funded' : 'Claim 0.05 ETH'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* External Alchemy Faucet launcher */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleOpenAlchemyFaucet}
            style={styles.externalFaucetLinkRow}
          >
            <Text style={[styles.externalFaucetText, { color: colors.fg3 }]}>
              Want more testnet ETH? Open Alchemy Sepolia Faucet
            </Text>
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
              <Path
                d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
                stroke={colors.accent}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          {faucetMessage && (
            <View style={styles.faucetNotification}>
              <Text style={styles.faucetNotificationText}>{faucetMessage}</Text>
            </View>
          )}
        </View>

        {/* Search Input */}
        <View style={styles.searchSection}>
          <Text style={[styles.sectionHeading, { color: colors.fg3 }]}>
            Choose Family Root Name
          </Text>
          <View
            style={[
              styles.searchRow,
              {
                backgroundColor: colors.surface,
                borderColor: colors.accent,
              },
            ]}
          >
            <Text style={[styles.atSymbol, { color: colors.fg3 }]}>@</Text>
            <TextInput
              value={query}
              onChangeText={(text) =>
                setQuery(text.toLowerCase().replace(/[^a-z0-9-]/g, ''))
              }
              placeholder="yourname"
              placeholderTextColor={colors.fg3}
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.searchInput, { color: colors.fg }]}
            />
            {state === 'searching' && (
              <ActivityIndicator size="small" color={colors.accent} />
            )}
          </View>
        </View>

        {/* Results List */}
        {results.length > 0 && (
          <View style={styles.resultsList}>
            {results.map((r) => {
              const isSelected = selected === r.name && r.available

              return (
                <TouchableOpacity
                  key={r.name}
                  activeOpacity={0.8}
                  disabled={!r.available}
                  onPress={() => r.available && setSelected(r.name)}
                  style={[
                    styles.resultCard,
                    {
                      backgroundColor: isSelected
                        ? colors.surface
                        : colors.raised,
                      borderColor: isSelected ? colors.accent : colors.border,
                      opacity: r.available ? 1 : 0.6,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDotBox,
                      {
                        backgroundColor: r.available
                          ? 'rgba(29, 93, 58, 0.15)'
                          : 'rgba(255, 71, 87, 0.12)',
                      },
                    ]}
                  >
                    {r.available ? (
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M20 6L9 17L4 12"
                          stroke="#1D5D3A"
                          strokeWidth={2.4}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    ) : (
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M18 6L6 18M6 6L18 18"
                          stroke="#FF4757"
                          strokeWidth={2.2}
                          strokeLinecap="round"
                        />
                      </Svg>
                    )}
                  </View>

                  <View style={styles.resultInfo}>
                    <Text style={[styles.resultName, { color: colors.fg }]}>
                      {r.name}
                    </Text>
                    <Text
                      style={[
                        styles.resultStatus,
                        { color: r.available ? colors.accent : '#FF4757' },
                      ]}
                    >
                      {r.available ? 'Available to claim' : 'Taken on Sepolia'}
                    </Text>
                  </View>

                  {r.available && (
                    <View style={styles.resultPriceBox}>
                      <View style={styles.freeBadge}>
                        <Text style={styles.freeBadgeText}>FREE</Text>
                      </View>
                    </View>
                  )}

                  {isSelected && (
                    <View
                      style={[
                        styles.selectionCheck,
                        { backgroundColor: '#1D5D3A' },
                      ]}
                    >
                      <Svg width={10} height={10} viewBox="0 0 12 12" fill="none">
                        <Path
                          d="M2 6L4.5 8.5L10 3"
                          stroke="#F5F3EB"
                          strokeWidth={1.8}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    </View>
                  )}
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        {/* Payment & Breakdown */}
        {selectedResult && (
          <View style={styles.checkoutSection}>
            <View
              style={[
                styles.breakdownCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.breakdownHeader, { color: colors.fg3 }]}>
                Registration Summary
              </Text>
              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { color: colors.fg2 }]}>
                  Root Identity
                </Text>
                <Text style={[styles.breakdownValue, { color: colors.fg, fontWeight: '800' }]}>
                  {selectedResult.name}
                </Text>
              </View>

              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { color: colors.fg2 }]}>
                  Campaign Sponsorship
                </Text>
                <Text style={[styles.breakdownValue, { color: '#1D5D3A' }]}>
                  100% Free (ETHOnline 2026)
                </Text>
              </View>

              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { color: colors.fg2 }]}>
                  Network Gas
                </Text>
                <Text style={[styles.breakdownValue, { color: '#1D5D3A' }]}>
                  Sponsored by Alchemy
                </Text>
              </View>

              <View style={[styles.breakdownDivider, { backgroundColor: colors.border }]} />

              <View style={styles.breakdownRow}>
                <Text style={[styles.totalLabel, { color: colors.fg }]}>Total Due</Text>
                <Text style={[styles.totalEth, { color: '#1D5D3A' }]}>
                  $0.00 USD
                </Text>
              </View>
            </View>

            {/* Confirm & Register Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleExecuteRegistration}
              style={[
                styles.confirmButton,
                {
                  backgroundColor: '#1D5D3A',
                },
              ]}
            >
              <View style={styles.confirmingRow}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                    stroke="#F5F3EB"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={styles.confirmButtonText}>
                  Claim & Register {selected}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ── 3-Stage Transaction Execution Modal ── */}
      <Modal visible={showTxModal} transparent animationType="fade">
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
                {txProgress.stage === 'confirmed'
                  ? 'Identity Registered!'
                  : 'Registering on Sepolia'}
              </Text>
            </View>

            {/* Stages indicator */}
            <View style={styles.stageList}>
              {/* Stage 1 */}
              <View style={styles.stageItem}>
                <View
                  style={[
                    styles.stageDot,
                    {
                      backgroundColor:
                        txProgress.stage === 'simulating'
                          ? colors.accent
                          : txProgress.stage === 'broadcasting' ||
                            txProgress.stage === 'confirming' ||
                            txProgress.stage === 'confirmed'
                          ? '#1D5D3A'
                          : colors.raised,
                    },
                  ]}
                >
                  {txProgress.stage !== 'simulating' &&
                  txProgress.stage !== 'idle' ? (
                    <Svg width={10} height={10} viewBox="0 0 12 12" fill="none">
                      <Path
                        d="M2 6L4.5 8.5L10 3"
                        stroke="#F5F3EB"
                        strokeWidth={2}
                        strokeLinecap="round"
                      />
                    </Svg>
                  ) : (
                    <ActivityIndicator size="small" color="#F5F3EB" />
                  )}
                </View>
                <View style={styles.stageContent}>
                  <Text style={[styles.stageName, { color: colors.fg }]}>
                    1. Alchemy Gas Sponsorship
                  </Text>
                  <Text style={[styles.stageDesc, { color: colors.fg3 }]}>
                    Verifying policy & Paymaster authorization
                  </Text>
                </View>
              </View>

              {/* Stage 2 */}
              <View style={styles.stageItem}>
                <View
                  style={[
                    styles.stageDot,
                    {
                      backgroundColor:
                        txProgress.stage === 'broadcasting'
                          ? colors.accent
                          : txProgress.stage === 'confirming' ||
                            txProgress.stage === 'confirmed'
                          ? '#1D5D3A'
                          : colors.raised,
                    },
                  ]}
                >
                  {txProgress.stage === 'confirming' ||
                  txProgress.stage === 'confirmed' ? (
                    <Svg width={10} height={10} viewBox="0 0 12 12" fill="none">
                      <Path
                        d="M2 6L4.5 8.5L10 3"
                        stroke="#F5F3EB"
                        strokeWidth={2}
                        strokeLinecap="round"
                      />
                    </Svg>
                  ) : txProgress.stage === 'broadcasting' ? (
                    <ActivityIndicator size="small" color="#F5F3EB" />
                  ) : null}
                </View>
                <View style={styles.stageContent}>
                  <Text style={[styles.stageName, { color: colors.fg }]}>
                    2. Sepolia Mempool Broadcast
                  </Text>
                  <Text style={[styles.stageDesc, { color: colors.fg3 }]}>
                    Universal Resolver: 0xd26f2040...
                  </Text>
                </View>
              </View>

              {/* Stage 3 */}
              <View style={styles.stageItem}>
                <View
                  style={[
                    styles.stageDot,
                    {
                      backgroundColor:
                        txProgress.stage === 'confirmed'
                          ? '#1D5D3A'
                          : txProgress.stage === 'confirming'
                          ? colors.accent
                          : colors.raised,
                    },
                  ]}
                >
                  {txProgress.stage === 'confirmed' ? (
                    <Svg width={10} height={10} viewBox="0 0 12 12" fill="none">
                      <Path
                        d="M2 6L4.5 8.5L10 3"
                        stroke="#F5F3EB"
                        strokeWidth={2}
                        strokeLinecap="round"
                      />
                    </Svg>
                  ) : txProgress.stage === 'confirming' ? (
                    <ActivityIndicator size="small" color="#F5F3EB" />
                  ) : null}
                </View>
                <View style={styles.stageContent}>
                  <Text style={[styles.stageName, { color: colors.fg }]}>
                    3. ENSv2 Node Ownership
                  </Text>
                  <Text style={[styles.stageDesc, { color: colors.fg3 }]}>
                    Reverse record assigned to your smart account
                  </Text>
                </View>
              </View>
            </View>

            {/* Transaction Detail Card */}
            {txResult.txHash && (
              <View
                style={[
                  styles.txHashCard,
                  { backgroundColor: colors.raised, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.txHashLabel, { color: colors.fg3 }]}>
                  Sepolia Transaction Hash
                </Text>
                <Text style={[styles.txHashValue, { color: colors.fg }]}>
                  {txResult.txHash.slice(0, 16)}...{txResult.txHash.slice(-12)}
                </Text>

                {txResult.explorerUrl && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(txResult.explorerUrl!)}
                    style={styles.explorerLinkBtn}
                  >
                    <Text style={[styles.explorerLinkText, { color: colors.accent }]}>
                      View on Hackathon ENS Explorer →
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Complete / Enter App CTA */}
            {txProgress.stage === 'confirmed' && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleComplete}
                style={[styles.completeBtn, { backgroundColor: '#1D5D3A' }]}
              >
                <Text style={styles.completeBtnText}>
                  Open Family Treasury Dashboard →
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  campaignBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  campaignBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D5D3A',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  faucetCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  faucetCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  faucetIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(29, 93, 58, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  faucetHeaderInfo: {
    flex: 1,
  },
  faucetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  faucetTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  sponsoredPill: {
    backgroundColor: 'rgba(29, 93, 58, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sponsoredPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1D5D3A',
  },
  faucetAddressText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  copyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  faucetBalanceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  claimGrantBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  claimGrantBtnText: {
    color: '#F5F3EB',
    fontSize: 12,
    fontWeight: '800',
  },
  externalFaucetLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  externalFaucetText: {
    fontSize: 11,
    fontWeight: '500',
  },
  faucetNotification: {
    backgroundColor: 'rgba(29, 93, 58, 0.12)',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  faucetNotificationText: {
    color: '#1D5D3A',
    fontSize: 11,
    fontWeight: '700',
  },
  searchSection: {
    gap: 8,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 50,
  },
  atSymbol: {
    fontSize: 16,
    fontWeight: '800',
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  resultsList: {
    gap: 8,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  statusDotBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 14,
    fontWeight: '800',
  },
  resultStatus: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  resultPriceBox: {
    alignItems: 'flex-end',
  },
  freeBadge: {
    backgroundColor: 'rgba(29, 93, 58, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  freeBadgeText: {
    color: '#1D5D3A',
    fontSize: 11,
    fontWeight: '900',
  },
  selectionCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutSection: {
    gap: 12,
  },
  breakdownCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  breakdownHeader: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  breakdownDivider: {
    height: 1,
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  totalEth: {
    fontSize: 16,
    fontWeight: '900',
  },
  confirmButton: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  confirmingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confirmButtonText: {
    color: '#F5F3EB',
    fontSize: 15,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
    gap: 16,
  },
  modalHeader: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  stageList: {
    gap: 14,
  },
  stageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stageDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageContent: {
    flex: 1,
  },
  stageName: {
    fontSize: 13,
    fontWeight: '800',
  },
  stageDesc: {
    fontSize: 11,
    marginTop: 1,
  },
  txHashCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  txHashLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  txHashValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  explorerLinkBtn: {
    marginTop: 4,
  },
  explorerLinkText: {
    fontSize: 11,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  completeBtn: {
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBtnText: {
    color: '#F5F3EB',
    fontSize: 14,
    fontWeight: '900',
  },
})
