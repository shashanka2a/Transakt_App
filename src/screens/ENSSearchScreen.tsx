import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native'
import Svg, { Path, Rect, Circle } from 'react-native-svg'
import { useTheme } from '../ThemeContext'
import { useAuth } from '../AuthContext'
import { MetaMaskIcon, WalletConnectIcon } from '../components/Icons'

interface Props {
  onPurchase: () => void
}

type ResultState = 'idle' | 'searching' | 'results'

const ETH_USD = 3240
const usdToEth = (usd: number) => usd / ETH_USD

const mockResults = (q: string) => [
  { name: `${q}.eth`, available: false, usd: null },
  { name: `${q}fam.eth`, available: true, usd: 15.0 },
  { name: `${q}pay.eth`, available: true, usd: 12.0 },
]

export default function ENSSearchScreen({ onPurchase }: Props) {
  const { colors } = useTheme()
  const { user } = useAuth()
  const [query, setQuery] = useState('smith')
  const [state, setState] = useState<ResultState>('results')
  const [selected, setSelected] = useState('smithfam.eth')
  const [confirming, setConfirming] = useState(false)

  const walletAddress = user?.address
    ? user.address.length > 15
      ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}`
      : user.address
    : '0x71C7...3f9E'

  const ethBalance = 0.087
  const usdBalance = ethBalance * ETH_USD

  useEffect(() => {
    if (!query) {
      setState('idle')
      return
    }
    setState('searching')
    const t = setTimeout(() => setState('results'), 500)
    return () => clearTimeout(t)
  }, [query])

  const results = state === 'results' ? mockResults(query) : []
  const selectedResult = results.find((r) => r.name === selected && r.available)

  const regEth = selectedResult ? usdToEth(selectedResult.usd ?? 0) : 0
  const gasEth = 0.00012
  const totalEth = regEth + gasEth
  const sufficient = ethBalance >= totalEth

  const handleConfirm = () => {
    setConfirming(true)
    setTimeout(() => onPurchase(), 1400)
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: colors.mt10,
              borderColor: colors.mb20,
            },
          ]}
        >
          <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 2L4 6V12C4 16.42 7.58 20.17 12 21C16.42 20.17 20 16.42 20 12V6L12 2Z"
              stroke={colors.accent}
              strokeWidth={1.8}
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={[styles.badgeText, { color: colors.accent }]}>
            ENSv2 · Onchain Identity
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.fg }]}>
          Secure your family's{'\n'}onchain identity.
        </Text>
        <Text style={[styles.subtitle, { color: colors.fg2 }]}>
          Your root ENS name becomes the family bank address.
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Input */}
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
            style={[styles.searchInput, { color: colors.fg }]}
          />
          <Text style={[styles.ethSuffix, { color: colors.fg3 }]}>.eth</Text>
          {state === 'searching' && (
            <ActivityIndicator size="small" color={colors.accent} style={{ marginLeft: 8 }} />
          )}
        </View>

        {/* Results */}
        {state === 'results' && (
          <View style={styles.resultsContainer}>
            <Text style={[styles.sectionHeading, { color: colors.fg3 }]}>
              Search Results
            </Text>
            {results.map((r) => {
              const isSelected = selected === r.name

              return (
                <TouchableOpacity
                  key={r.name}
                  activeOpacity={0.8}
                  disabled={!r.available}
                  onPress={() => r.available && setSelected(r.name)}
                  style={[
                    styles.resultItem,
                    {
                      backgroundColor: isSelected ? colors.mt10 : colors.surface,
                      borderColor: isSelected ? colors.accent : colors.border,
                      opacity: r.available ? 1 : 0.6,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.resultIconCircle,
                      {
                        backgroundColor: r.available ? colors.mt16 : 'rgba(255,71,87,0.1)',
                      },
                    ]}
                  >
                    {r.available ? (
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M20 6L9 17L4 12"
                          stroke={colors.accent}
                          strokeWidth={2.5}
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
                      {r.available ? 'Available' : 'Taken'}
                    </Text>
                  </View>

                  {r.available && r.usd && (
                    <View style={styles.resultPriceBox}>
                      <Text style={[styles.resultEthPrice, { color: colors.fg }]}>
                        {usdToEth(r.usd).toFixed(5)} ETH
                      </Text>
                      <Text style={[styles.resultPeriod, { color: colors.fg3 }]}>/ year</Text>
                    </View>
                  )}

                  {isSelected && (
                    <View
                      style={[
                        styles.selectionCheck,
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
            <Text style={[styles.sectionHeading, { color: colors.fg3 }]}>
              Pay from Wallet
            </Text>

            {/* Connected Wallet (External or Embedded) */}
            <View
              style={[
                styles.walletCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.walletHeaderRow}>
                <View
                  style={[
                    styles.privyIcon,
                    {
                      backgroundColor: colors.raised,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  {user?.authMethod === 'metamask' ? (
                    <MetaMaskIcon size={22} />
                  ) : user?.authMethod === 'walletconnect' ? (
                    <WalletConnectIcon size={22} />
                  ) : (
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                      <Rect x="3" y="6" width="18" height="13" rx="2" stroke={colors.accent} strokeWidth={1.6} />
                      <Path d="M3 10h18" stroke={colors.accent} strokeWidth={1.4} />
                      <Circle cx="7" cy="14.5" r="1.5" fill={colors.accent} />
                    </Svg>
                  )}
                </View>
                <View style={styles.walletInfo}>
                  <Text style={[styles.walletTitle, { color: colors.fg3 }]}>
                    {user?.authMethod === 'metamask'
                      ? 'MetaMask Wallet'
                      : user?.authMethod === 'walletconnect'
                      ? 'WalletConnect'
                      : 'Privy Embedded Wallet'}
                  </Text>
                  <Text style={[styles.walletAddress, { color: colors.fg }]}>
                    {walletAddress}
                  </Text>
                </View>
                <View style={styles.walletBalanceBox}>
                  <Text style={[styles.walletBalanceEth, { color: colors.fg }]}>
                    {ethBalance.toFixed(4)}{' '}
                    <Text style={{ fontSize: 11, color: colors.fg3 }}>ETH</Text>
                  </Text>
                  <Text style={[styles.walletBalanceUsd, { color: colors.fg3 }]}>
                    ≈ ${usdBalance.toFixed(0)}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.networkBadge,
                  {
                    backgroundColor: colors.raised,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={[styles.networkDot, { backgroundColor: '#627EEA' }]} />
                <Text style={[styles.networkText, { color: colors.fg3 }]}>
                  Ethereum Mainnet
                </Text>
              </View>
            </View>

            {/* Transaction Breakdown */}
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
                Transaction
              </Text>
              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { color: colors.fg2 }]}>
                  Register <Text style={{ fontWeight: '800', color: colors.fg }}>{selectedResult.name}</Text>
                </Text>
                <Text style={[styles.breakdownValue, { color: colors.fg }]}>
                  {regEth.toFixed(5)} ETH
                </Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { color: colors.fg2 }]}>
                  Gas (estimate)
                </Text>
                <Text style={[styles.breakdownValue, { color: colors.fg }]}>
                  ~{gasEth.toFixed(5)} ETH
                </Text>
              </View>

              <View style={[styles.breakdownDivider, { backgroundColor: colors.border }]} />

              <View style={styles.breakdownRow}>
                <Text style={[styles.totalLabel, { color: colors.fg }]}>Total</Text>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.totalEth, { color: colors.accent }]}>
                    {totalEth.toFixed(5)} ETH
                  </Text>
                  <Text style={[styles.totalUsd, { color: colors.fg3 }]}>
                    ≈ ${(totalEth * ETH_USD).toFixed(2)}
                  </Text>
                </View>
              </View>

              <View style={[styles.balanceAfterRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.balanceAfterLabel, { color: colors.fg3 }]}>
                  Balance after
                </Text>
                <Text
                  style={[
                    styles.balanceAfterValue,
                    { color: sufficient ? colors.fg2 : '#FF4757' },
                  ]}
                >
                  {(ethBalance - totalEth).toFixed(5)} ETH
                </Text>
              </View>
            </View>

            {/* Insufficient funds */}
            {!sufficient && (
              <View style={styles.warningBox}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 9v4M12 17h.01" stroke="#FF4757" strokeWidth={2} strokeLinecap="round" />
                  <Path
                    d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                    stroke="#FF4757"
                    strokeWidth={1.6}
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={styles.warningText}>
                  Insufficient ETH. Add funds to your Privy wallet.
                </Text>
              </View>
            )}

            {/* Confirm CTA */}
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={confirming || !sufficient}
              onPress={handleConfirm}
              style={[
                styles.confirmButton,
                {
                  backgroundColor: sufficient ? colors.accent : colors.raised,
                },
              ]}
            >
              {confirming ? (
                <View style={styles.confirmingRow}>
                  <ActivityIndicator size="small" color={colors.accentFg} />
                  <Text style={[styles.confirmButtonText, { color: colors.accentFg }]}>
                    Registering…
                  </Text>
                </View>
              ) : (
                <View style={styles.confirmingRow}>
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke={sufficient ? colors.accentFg : colors.fg3}
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                  <Text
                    style={[
                      styles.confirmButtonText,
                      { color: sufficient ? colors.accentFg : colors.fg3 },
                    ]}
                  >
                    Confirm from Wallet
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={[styles.signingNote, { color: colors.fg3 }]}>
              Transaction signed with your Passkey · No seed phrase required
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 32,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    height: 58,
    marginBottom: 20,
  },
  atSymbol: {
    fontSize: 18,
    fontWeight: '900',
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
  },
  ethSuffix: {
    fontSize: 18,
    fontWeight: '700',
  },
  resultsContainer: {
    gap: 8,
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
  },
  resultIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  resultStatus: {
    fontSize: 12,
    fontWeight: '700',
  },
  resultPriceBox: {
    alignItems: 'flex-end',
  },
  resultEthPrice: {
    fontSize: 13,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  resultPeriod: {
    fontSize: 10,
  },
  selectionCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutSection: {
    gap: 12,
  },
  walletCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  walletHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  privyIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletInfo: {
    flex: 1,
  },
  walletTitle: {
    fontSize: 11,
    fontWeight: '600',
  },
  walletAddress: {
    fontSize: 13,
    fontWeight: '800',
  },
  walletBalanceBox: {
    alignItems: 'flex-end',
  },
  walletBalanceEth: {
    fontSize: 14,
    fontWeight: '900',
  },
  walletBalanceUsd: {
    fontSize: 10,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  networkText: {
    fontSize: 10,
    fontWeight: '700',
  },
  breakdownCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  breakdownHeader: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontWeight: '900',
  },
  totalEth: {
    fontSize: 14,
    fontWeight: '900',
  },
  totalUsd: {
    fontSize: 10,
  },
  balanceAfterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderStyle: 'dashed',
    paddingTop: 8,
    marginTop: 4,
  },
  balanceAfterLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  balanceAfterValue: {
    fontSize: 11,
    fontWeight: '700',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,71,87,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,71,87,0.22)',
  },
  warningText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF4757',
    flex: 1,
  },
  confirmButton: {
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  confirmingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '900',
  },
  signingNote: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
})
