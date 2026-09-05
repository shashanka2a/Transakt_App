import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  Linking,
  Platform,
} from 'react-native'
import Svg, { Path, Rect, Circle } from 'react-native-svg'
import { useTheme } from '../ThemeContext'
import { useAuth } from '../AuthContext'
import { IconCheck, IconX, EthDiamond } from '../components/Icons'
import {
  checkEnsAvailability,
  EnsNameCheckResult,
  executeEnsRegistration,
  RegistrationProgress,
  ENSV2_HACKATHON_CONFIG,
} from '../services/ensv2Client'
import {
  getSepoliaBalance,
  watchSepoliaBalance,
  claimInAppGasGrant,
  isValidEthereumAddress,
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
    { name: 'smithfam.eth', available: true, usdPrice: 0, ethPrice: 0, isSubname: false },
    { name: 'smithpay.eth', available: true, usdPrice: 0, ethPrice: 0, isSubname: false },
    { name: 'smith.eth', available: false, usdPrice: null, ethPrice: null, isSubname: false },
  ])
  const [selected, setSelected] = useState('smithfam.eth')
  const [copied, setCopied] = useState(false)
  const [liveBalance, setLiveBalance] = useState<number | null>(null)
  const [isRefreshingBal, setIsRefreshingBal] = useState(false)
  const [isFunding, setIsFunding] = useState(false)
  const [fundedTxHash, setFundedTxHash] = useState<string | null>(null)

  // Registration Execution States
  const [showTxModal, setShowTxModal] = useState(false)
  const [txProgress, setTxProgress] = useState<RegistrationProgress>({
    stage: 'idle',
    detail: '',
  })
  const [txResult, setTxResult] = useState<{
    txHash?: string
    explorerUrl?: string
    appUrl?: string
  }>({})

  const rawAddress =
    user?.address && isValidEthereumAddress(user.address)
      ? user.address
      : '0x71C8a27B2f90A2E80562eA9b294D0A38e83f3F9E'
  const shortAddress = `${rawAddress.slice(0, 6)}...${rawAddress.slice(-4)}`

  // 1. Fetch actual live balance from Sepolia
  useEffect(() => {
    let isMounted = true

    const fetchBalance = async () => {
      setIsRefreshingBal(true)
      const bal = await getSepoliaBalance(rawAddress)
      if (isMounted) {
        setLiveBalance(bal)
        setIsRefreshingBal(false)
      }
    }

    fetchBalance()

    // Watch for live deposits
    const unwatch = watchSepoliaBalance(rawAddress, liveBalance || 0, (newBal) => {
      if (isMounted) {
        setLiveBalance(newBal)
      }
    })

    return () => {
      isMounted = false
      unwatch()
    }
  }, [rawAddress])

  // Debounced ENSv2 availability search
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
    }, 400)

    return () => {
      isMounted = false
      clearTimeout(t)
    }
  }, [query])

  const handleCopyAddress = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Handle in-app testnet wallet funding
  const handleFundWallet = async () => {
    if (isFunding) return
    setIsFunding(true)
    try {
      const grant = await claimInAppGasGrant(rawAddress)
      if (grant.success) {
        setLiveBalance((prev) => (prev !== null ? prev + grant.amountEth : grant.amountEth))
        setFundedTxHash(grant.txHash)
        setTimeout(() => setFundedTxHash(null), 10000)
      }
    } catch (err) {
      console.warn('Funding failed:', err)
    } finally {
      setIsFunding(false)
    }
  }

  // Execute ENSv2 Registration Onchain
  const handleExecuteRegistration = async () => {
    if (!selected) return

    setShowTxModal(true)
    setTxProgress({
      stage: 'simulating',
      detail: 'Verifying Gas Manager sponsorship policy...',
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

      setEnsName(selected)
    } catch (err: any) {
      setTxProgress({
        stage: 'error',
        detail: err?.message || 'Transaction failed. Please try again.',
      })
    }
  }

  const handleComplete = () => {
    setShowTxModal(false)
    onPurchase()
  }

  const selectedResult = results.find((r) => r.name === selected && r.available)

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* ── Top Header Bar ── */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View
            style={[
              styles.stepBadge,
              { backgroundColor: 'rgba(29, 93, 58, 0.12)', borderColor: 'rgba(29, 93, 58, 0.25)' },
            ]}
          >
            <View style={styles.activeDot} />
            <Text style={styles.stepBadgeText}>Free ENS Onboarding</Text>
          </View>

          <View style={styles.accountPillsRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleCopyAddress}
              style={[styles.accountPill, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={[styles.accountPillText, { color: colors.fg2 }]}>
                {copied
                  ? '✓ Copied'
                  : `${liveBalance !== null ? `${liveBalance.toFixed(3)} ETH · ` : ''}${shortAddress}`}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              disabled={isFunding}
              onPress={handleFundWallet}
              style={[
                styles.fundPill,
                {
                  backgroundColor: 'rgba(29, 93, 58, 0.12)',
                  borderColor: 'rgba(29, 93, 58, 0.3)',
                },
              ]}
            >
              {isFunding ? (
                <ActivityIndicator size="small" color="#1D5D3A" />
              ) : (
                <Text style={styles.fundPillText}>+0.05 Faucet</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Funded success notification */}
        {fundedTxHash && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => Linking.openURL(`https://sepolia.etherscan.io/tx/${fundedTxHash}`)}
            style={styles.fundedBanner}
          >
            <Text style={styles.fundedBannerText}>
              ✓ Funded +0.05 Sepolia ETH ·{' '}
              <Text style={{ textDecorationLine: 'underline', fontWeight: '800' }}>
                Verify Tx ↗
              </Text>
            </Text>
          </TouchableOpacity>
        )}

        <Text style={[styles.title, { color: colors.fg }]}>
          Choose your family handle.
        </Text>
        <Text style={[styles.subtitle, { color: colors.fg3 }]}>
          Your root ENS name is the master address for your treasury.
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Search Input ── */}
        <View
          style={[
            styles.searchRow,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.atSymbol, { color: '#1D5D3A' }]}>@</Text>
          <TextInput
            value={query}
            onChangeText={(text) =>
              setQuery(text.toLowerCase().replace(/[^a-z0-9-]/g, ''))
            }
            placeholder="smith"
            placeholderTextColor={colors.fg3}
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.searchInput, { color: colors.fg }]}
          />
          {state === 'searching' && (
            <ActivityIndicator size="small" color="#1D5D3A" />
          )}
          {query.length > 0 && state !== 'searching' && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <IconX size={14} color={colors.fg3} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Results List ── */}
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
                    backgroundColor: isSelected ? 'rgba(29, 93, 58, 0.08)' : colors.surface,
                    borderColor: isSelected ? '#1D5D3A' : colors.border,
                    borderWidth: isSelected ? 1.5 : 1,
                    opacity: r.available ? 1 : 0.5,
                  },
                ]}
              >
                <View style={styles.resultLeft}>
                  <View
                    style={[
                      styles.radioCircle,
                      {
                        borderColor: isSelected ? '#1D5D3A' : colors.border,
                        backgroundColor: isSelected ? '#1D5D3A' : 'transparent',
                      },
                    ]}
                  >
                    {isSelected && <IconCheck size={10} color="#F5F3EB" />}
                  </View>

                  <View style={styles.resultInfo}>
                    <Text
                      style={[
                        styles.resultName,
                        { color: isSelected ? '#1D5D3A' : colors.fg },
                      ]}
                    >
                      {r.name}
                    </Text>
                    <Text style={[styles.resultSubtitle, { color: colors.fg3 }]}>
                      {r.available
                        ? r.name.endsWith('fam.eth')
                          ? 'Recommended for Family Vault'
                          : 'Available on Sepolia'
                        : 'Unavailable on Sepolia'}
                    </Text>
                  </View>
                </View>

                {r.available ? (
                  <View style={styles.freeBadge}>
                    <Text style={styles.freeBadgeText}>FREE</Text>
                  </View>
                ) : (
                  <Text style={[styles.takenText, { color: colors.fg3 }]}>Taken</Text>
                )}
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Sponsorship Info Note */}
        <View style={styles.sponsorshipNote}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
              stroke="#1D5D3A"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={[styles.sponsorshipText, { color: colors.fg3 }]}>
            Sponsored by Transakt Gas Manager · Zero gas fees
          </Text>
        </View>

        {/* ── Testnet Verification Link at Bottom ── */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => Linking.openURL(`https://sepolia.etherscan.io/address/${rawAddress}`)}
          style={styles.verifyLinkRow}
        >
          <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
            <Path
              d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
              stroke="#1D5D3A"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={[styles.verifyLinkText, { color: colors.fg3 }]}>
            Verify wallet on{' '}
            <Text style={{ color: '#1D5D3A', fontWeight: '700' }}>
              ETH Sepolia Testnet (Etherscan) ↗
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Fixed Bottom Floating Action Bar ── */}
      {selectedResult && (
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
            },
          ]}
        >
          <View style={styles.bottomBarInfo}>
            <Text style={[styles.selectedLabel, { color: colors.fg3 }]}>
              Selected Handle
            </Text>
            <Text style={[styles.selectedName, { color: colors.fg }]}>
              {selectedResult.name}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleExecuteRegistration}
            style={styles.claimButton}
          >
            <Text style={styles.claimButtonText}>Claim Identity →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Registration Progress Modal ── */}
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
            <Text style={[styles.modalTitle, { color: colors.fg }]}>
              {txProgress.stage === 'confirmed'
                ? 'Ownership Confirmed!'
                : 'Registering on Sepolia'}
            </Text>

            <Text style={[styles.modalSubtitle, { color: colors.fg3 }]}>
              {txProgress.detail}
            </Text>

            {/* Stages Tracker */}
            <View style={styles.stagesContainer}>
              {[
                { key: 'simulating', label: '1. Gas Manager Sponsorship' },
                { key: 'broadcasting', label: '2. Sepolia Mempool Broadcast' },
                { key: 'confirming', label: '3. ENSv2 Node Minting' },
              ].map((step, idx) => {
                const isPassed =
                  (step.key === 'simulating' && txProgress.stage !== 'idle') ||
                  (step.key === 'broadcasting' &&
                    (txProgress.stage === 'confirming' || txProgress.stage === 'confirmed')) ||
                  (step.key === 'confirming' && txProgress.stage === 'confirmed')

                const isCurrent = txProgress.stage === step.key

                return (
                  <View key={step.key} style={styles.stageRow}>
                    <View
                      style={[
                        styles.stageBadge,
                        {
                          backgroundColor: isPassed
                            ? '#1D5D3A'
                            : isCurrent
                            ? 'rgba(29, 93, 58, 0.15)'
                            : colors.raised,
                        },
                      ]}
                    >
                      {isPassed ? (
                        <IconCheck size={10} color="#F5F3EB" />
                      ) : isCurrent ? (
                        <ActivityIndicator size="small" color="#1D5D3A" />
                      ) : (
                        <Text style={{ fontSize: 10, color: colors.fg3 }}>{idx + 1}</Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stageText,
                        {
                          color: isPassed || isCurrent ? colors.fg : colors.fg3,
                          fontWeight: isCurrent ? '800' : '600',
                        },
                      ]}
                    >
                      {step.label}
                    </Text>
                  </View>
                )
              })}
            </View>

            {/* Verification Links (ETH Sepolia Testnet & ENS Portal) */}
            {txResult.txHash && (
              <View style={styles.modalLinksContainer}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => Linking.openURL(`https://sepolia.etherscan.io/tx/${txResult.txHash}`)}
                  style={styles.txVerifyButton}
                >
                  <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
                      stroke="#1D5D3A"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                  <Text style={styles.txVerifyButtonText}>
                    Verify ETH Sepolia Testnet Transaction ↗
                  </Text>
                </TouchableOpacity>

                {txResult.explorerUrl && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => Linking.openURL(txResult.explorerUrl!)}
                    style={styles.explorerBtn}
                  >
                    <Text style={styles.explorerBtnText}>
                      View on Hackathon ENSv2 Explorer ↗
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Final CTA */}
            {txProgress.stage === 'confirmed' && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleComplete}
                style={styles.doneBtn}
              >
                <Text style={styles.doneBtnText}>
                  Enter Family Treasury Dashboard →
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
    paddingTop: 10,
    paddingBottom: 14,
    gap: 6,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1D5D3A',
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D5D3A',
  },
  accountPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  accountPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  accountPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  fundPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fundPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D5D3A',
  },
  fundedBanner: {
    backgroundColor: 'rgba(29, 93, 58, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(29, 93, 58, 0.25)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  fundedBannerText: {
    color: '#1D5D3A',
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 14,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 52,
  },
  atSymbol: {
    fontSize: 18,
    fontWeight: '900',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  resultsList: {
    gap: 10,
    marginTop: 4,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 18,
  },
  resultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 15,
    fontWeight: '800',
  },
  resultSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  freeBadge: {
    backgroundColor: 'rgba(29, 93, 58, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  freeBadgeText: {
    color: '#1D5D3A',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  takenText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sponsorshipNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  sponsorshipText: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  bottomBarInfo: {
    flex: 1,
  },
  selectedLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  selectedName: {
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },
  claimButton: {
    backgroundColor: '#1D5D3A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  claimButtonText: {
    color: '#F5F3EB',
    fontSize: 14,
    fontWeight: '900',
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
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  modalSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  stagesContainer: {
    gap: 10,
    marginVertical: 4,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stageBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageText: {
    fontSize: 12,
  },
  verifyLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 2,
    marginBottom: 8,
  },
  verifyLinkText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalLinksContainer: {
    gap: 8,
    marginVertical: 4,
  },
  txVerifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(29, 93, 58, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(29, 93, 58, 0.25)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  txVerifyButtonText: {
    color: '#1D5D3A',
    fontSize: 12,
    fontWeight: '800',
  },
  explorerBtn: {
    paddingVertical: 4,
    alignItems: 'center',
  },
  explorerBtnText: {
    color: '#1D5D3A',
    fontSize: 11,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  doneBtn: {
    backgroundColor: '#1D5D3A',
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  doneBtnText: {
    color: '#F5F3EB',
    fontSize: 13,
    fontWeight: '900',
  },
})
