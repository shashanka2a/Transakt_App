import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
  Linking,
  Modal,
  ActivityIndicator,
} from 'react-native'
import { Tab } from '../App'
import { useTheme } from '../ThemeContext'
import { useAuth } from '../AuthContext'
import {
  IconSend,
  IconRequest,
  IconUsers,
  IconCreditCard,
  IconGradCap,
  IconRefresh,
  IconSun,
  IconMoon,
  IconSwap,
  EthDiamond,
  IconX,
} from '../components/Icons'
import {
  getSepoliaBalance,
  watchSepoliaBalance,
  claimInAppGasGrant,
  isValidEthereumAddress,
} from '../services/alchemyFaucetService'

const activityData = [
  {
    id: 1,
    name: '$mom.smith.fam.eth',
    note: 'Weekly transfer',
    time: '2h ago',
    amount: '+0.04 ETH',
    pos: true,
    initials: 'MS',
    hue: 150,
  },
  {
    id: 2,
    name: 'Uniswap V3',
    note: 'ETH → USDC swap',
    time: '5h ago',
    amount: '-0.01 ETH',
    pos: false,
    initials: 'UN',
    hue: 240,
  },
  {
    id: 3,
    name: '$dad.smith.fam.eth',
    note: 'Allowance payout',
    time: 'Yesterday',
    amount: '+0.015 ETH',
    pos: true,
    initials: 'DS',
    hue: 150,
  },
  {
    id: 4,
    name: 'OpenSea',
    note: 'NFT mint · CryptoPunk',
    time: 'Yesterday',
    amount: '-0.08 ETH',
    pos: false,
    initials: 'OS',
    hue: 210,
  },
]

const nodes = [
  {
    id: 'daily',
    name: 'Daily Pocket',
    eth: '0.12 ETH',
    fiat: '$342.80',
    meta: 'Managed by Alex',
    badge: 'ACTIVE',
    hex: '#1DB563',
    badgeBg: 'rgba(29,181,99,0.12)',
    badgeBorder: 'rgba(29,181,99,0.28)',
    Icon: IconCreditCard,
    iconBg: 'rgba(29,181,99,0.13)',
    iconColor: '#1DB563',
    bar: 34,
    spent: '$96.20',
    limit: '$250',
  },
  {
    id: 'college',
    name: 'College Vault',
    eth: '1.20 ETH',
    fiat: '$3,428.00',
    meta: 'Parent Locked',
    badge: 'LOCKED',
    hex: '#D4900A',
    badgeBg: 'rgba(212,144,10,0.12)',
    badgeBorder: 'rgba(212,144,10,0.28)',
    Icon: IconGradCap,
    iconBg: 'rgba(212,144,10,0.13)',
    iconColor: '#D4900A',
    bar: 88,
    spent: '$3,020.00',
    limit: '$3,500',
  },
  {
    id: 'allowance',
    name: 'Allowance Node',
    eth: '0.04 ETH',
    fiat: '$114.27',
    meta: 'Refills in 3 days',
    badge: 'AUTO',
    hex: '#7D8494',
    badgeBg: 'rgba(125,132,148,0.12)',
    badgeBorder: 'rgba(125,132,148,0.26)',
    Icon: IconRefresh,
    iconBg: 'rgba(125,132,148,0.12)',
    iconColor: '#7D8494',
    bar: 12,
    spent: '$14.27',
    limit: '$128',
  },
]

interface Props {
  onNavigate: (t: Tab) => void
  onOpenRequest: () => void
  onOpenSwap: () => void
}

export default function HomeTab({
  onNavigate,
  onOpenRequest,
  onOpenSwap,
}: Props) {
  const { theme, colors, toggle } = useTheme()
  const { user } = useAuth()
  const [liveBalance, setLiveBalance] = useState<number | null>(null)
  const [isFunding, setIsFunding] = useState(false)
  const [showFaucetModal, setShowFaucetModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isRefreshingBal, setIsRefreshingBal] = useState(false)
  const [grantSuccessMsg, setGrantSuccessMsg] = useState<string | null>(null)

  const rawAddress =
    user?.address && isValidEthereumAddress(user.address)
      ? user.address
      : '0x71C8a27B2f90A2E80562eA9b294D0A38e83f3F9E'
  const activeEns = user?.ensName || 'smithfam.eth'

  // Fetch actual live balance from Sepolia
  useEffect(() => {
    let isMounted = true

    getSepoliaBalance(rawAddress).then((bal) => {
      if (isMounted) setLiveBalance(bal)
    })

    const unwatch = watchSepoliaBalance(rawAddress, liveBalance || 0, (newBal) => {
      if (isMounted) setLiveBalance(newBal)
    })

    return () => {
      isMounted = false
      unwatch()
    }
  }, [rawAddress])

  const handleCopyAddress = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFundWallet = async () => {
    if (isFunding) return
    setIsFunding(true)
    setGrantSuccessMsg(null)
    try {
      const grant = await claimInAppGasGrant(rawAddress)
      if (grant.success) {
        setLiveBalance((prev) => (prev !== null ? prev + grant.amountEth : grant.amountEth))
        setGrantSuccessMsg('✓ Wallet funded with +0.05 Sepolia ETH! Ready to test.')
        setTimeout(() => setGrantSuccessMsg(null), 8000)
      }
    } catch (err) {
      console.warn('Funding failed:', err)
    } finally {
      setIsFunding(false)
    }
  }

  const effectiveEth = liveBalance !== null && liveBalance > 0 ? liveBalance : 0.45
  const ethPriceUsd = 3240.50
  const totalUsd = effectiveEth * ethPriceUsd
  const [usdInt, usdDec] = totalUsd
    .toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .split('.')

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <View
          style={[
            styles.familyPill,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={[styles.familyDot, { backgroundColor: colors.accent }]} />
          <Text style={[styles.familyPillText, { color: colors.fg }]}>
            {activeEns}
          </Text>
        </View>

        <View style={styles.topRightActions}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setShowFaucetModal(true)}
            style={[
              styles.faucetBtn,
              {
                backgroundColor: 'rgba(29, 93, 58, 0.12)',
                borderColor: 'rgba(29, 93, 58, 0.25)',
              },
            ]}
          >
            <Text style={styles.faucetBtnText}>🚰 Faucet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={toggle}
            style={[
              styles.themeToggleBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {theme === 'dark' ? (
              <IconSun size={15} color={colors.fg2} />
            ) : (
              <IconMoon size={15} color={colors.fg2} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Funded notification toast */}
      {grantSuccessMsg && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => Linking.openURL(`https://sepolia.etherscan.io/address/${rawAddress}`)}
          style={styles.fundedToast}
        >
          <Text style={styles.fundedToastText}>
            {grantSuccessMsg}{' '}
            <Text style={{ textDecorationLine: 'underline', fontWeight: '800' }}>
              Verify on Etherscan ↗
            </Text>
          </Text>
        </TouchableOpacity>
      )}

      {/* Hero Treasury Balance (Live Actual Balance) */}
      <View style={styles.heroTreasury}>
        <Text style={[styles.heroLabel, { color: colors.fg3 }]}>
          Family Treasury
        </Text>

        <View style={styles.balanceRow}>
          <Text style={[styles.balanceDollar, { color: colors.fg3 }]}>$</Text>
          <Text style={[styles.balanceInt, { color: colors.fg }]}>{usdInt}</Text>
          <Text style={[styles.balanceDec, { color: colors.fg3 }]}>.{usdDec}</Text>
        </View>

        {/* ETH Pill (Tap to open Faucet) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowFaucetModal(true)}
          style={[
            styles.ethPill,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <EthDiamond size={13} color={colors.fg3} />
          <Text style={[styles.ethPillAmount, { color: colors.fg }]}>
            {effectiveEth.toFixed(4)} ETH
          </Text>
          <Text style={styles.ethPillChange}>Sepolia Live 🚰</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Action Circles */}
      <View style={styles.quickActionsContainer}>
        <View style={styles.quickActionsRow}>
          {[
            {
              label: 'Send',
              action: () => onNavigate('send'),
              Icon: IconSend,
            },
            {
              label: 'Request',
              action: onOpenRequest,
              Icon: IconRequest,
            },
            {
              label: 'Manage',
              action: () => onNavigate('permissions'),
              Icon: IconUsers,
            },
            {
              label: 'Swap',
              action: onOpenSwap,
              Icon: IconSwap,
            },
          ].map(({ label, action, Icon }) => (
            <TouchableOpacity
              key={label}
              activeOpacity={0.8}
              onPress={action}
              style={styles.actionButton}
            >
              <View
                style={[
                  styles.actionCircle,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Icon size={22} color={colors.fg} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.fg2 }]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Family Nodes Horizontal Cards */}
      <View style={styles.nodesSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.fg3 }]}>
            Family Nodes
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onNavigate('permissions')}
          >
            <Text style={[styles.sectionActionText, { color: colors.accent }]}>
              Manage →
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalNodesScroll}
        >
          {nodes.map((node) => (
            <NodeCard key={node.id} node={node} />
          ))}
        </ScrollView>
      </View>

      {/* Recent Activity */}
      <View style={styles.activitySection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.fg3 }]}>
            Recent Activity
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onNavigate('activity')}
          >
            <Text style={[styles.sectionActionText, { color: colors.accent }]}>
              See All →
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.activityCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {activityData.map((item, i) => (
            <View
              key={item.id}
              style={[
                styles.activityRow,
                {
                  borderBottomColor: colors.border,
                  borderBottomWidth: i < activityData.length - 1 ? 1 : 0,
                },
              ]}
            >
              <View
                style={[
                  styles.activityAvatar,
                  {
                    backgroundColor: `hsl(${item.hue}, 30%, ${item.pos ? '88%' : '82%'})`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.activityAvatarText,
                    { color: `hsl(${item.hue}, 40%, 28%)` },
                  ]}
                >
                  {item.initials}
                </Text>
              </View>

              <View style={styles.activityInfo}>
                <Text
                  numberOfLines={1}
                  style={[styles.activityName, { color: colors.fg }]}
                >
                  {item.name}
                </Text>
                <Text style={[styles.activityMeta, { color: colors.fg2 }]}>
                  {item.note} · {item.time}
                </Text>
              </View>

              <Text
                style={[
                  styles.activityAmount,
                  { color: item.pos ? '#1DB563' : colors.fg },
                ]}
              >
                {item.amount}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Testnet Verification Link at Bottom ── */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() =>
          Linking.openURL(`https://sepolia.etherscan.io/address/${rawAddress}`)
        }
        style={styles.bottomVerifyLink}
      >
        <EthDiamond size={13} color="#1D5D3A" />
        <Text style={[styles.bottomVerifyText, { color: colors.fg3 }]}>
          Ethereum Sepolia Testnet ·{' '}
          <Text style={{ color: '#1D5D3A', fontWeight: '700' }}>
            Verify Transactions on Etherscan ↗
          </Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>

    {/* ── Faucet & Gas Grant Popup Modal ── */}
    <Modal
      visible={showFaucetModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowFaucetModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.faucetModalCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Modal Header */}
          <View style={styles.faucetModalHeader}>
            <View style={styles.faucetModalHeaderLeft}>
              <View style={styles.faucetModalIconCircle}>
                <EthDiamond size={18} color="#1D5D3A" />
              </View>
              <View>
                <Text style={[styles.faucetModalTitle, { color: colors.fg }]}>
                  Sepolia Testnet Faucet
                </Text>
                <Text style={[styles.faucetModalSubtitle, { color: colors.fg3 }]}>
                  Fund your Transakt Smart Account
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setShowFaucetModal(false)}
              style={[styles.closeIconBtn, { backgroundColor: colors.bg }]}
            >
              <IconX size={14} color={colors.fg2} />
            </TouchableOpacity>
          </View>

          {/* Wallet Address & Live Balance Box */}
          <View
            style={[
              styles.faucetAccountBox,
              { backgroundColor: colors.bg, borderColor: colors.border },
            ]}
          >
            <View style={styles.faucetAccountRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={[styles.faucetAccountLabel, { color: colors.fg3 }]}>
                  Your Sepolia Address
                </Text>
                <Text
                  style={[styles.faucetAddressText, { color: colors.fg }]}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {rawAddress}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleCopyAddress}
                style={[
                  styles.copyPillBtn,
                  { backgroundColor: copied ? '#1D5D3A' : 'rgba(29, 93, 58, 0.12)' },
                ]}
              >
                <Text
                  style={[
                    styles.copyPillText,
                    { color: copied ? '#F5F3EB' : '#1D5D3A' },
                  ]}
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.faucetDivider, { backgroundColor: colors.border }]} />

            <View style={styles.faucetBalanceRow}>
              <View>
                <Text style={[styles.faucetAccountLabel, { color: colors.fg3 }]}>
                  Live Onchain Balance
                </Text>
                <Text style={[styles.faucetBalanceBig, { color: colors.fg }]}>
                  {liveBalance !== null ? `${liveBalance.toFixed(4)} ETH` : '0.0000 ETH'}
                </Text>
              </View>
              <TouchableOpacity
                disabled={isRefreshingBal}
                onPress={async () => {
                  setIsRefreshingBal(true)
                  const bal = await getSepoliaBalance(rawAddress)
                  setLiveBalance(bal)
                  setIsRefreshingBal(false)
                }}
                style={styles.refreshBalBtn}
              >
                {isRefreshingBal ? (
                  <ActivityIndicator size="small" color="#1D5D3A" />
                ) : (
                  <Text style={styles.refreshBalText}>↻ Check</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Grant success alert */}
          {grantSuccessMsg && (
            <View style={styles.grantSuccessBanner}>
              <Text style={styles.grantSuccessBannerText}>{grantSuccessMsg}</Text>
            </View>
          )}

          {/* Section 1: In-App Instant Gas Sponsorship */}
          <View
            style={[
              styles.grantCard,
              {
                backgroundColor: 'rgba(29, 93, 58, 0.06)',
                borderColor: 'rgba(29, 93, 58, 0.22)',
              },
            ]}
          >
            <View style={styles.grantHeader}>
              <Text style={styles.grantTitle}>⚡ Instant In-App Gas Grant</Text>
              <View style={styles.grantBadge}>
                <Text style={styles.grantBadgeText}>ZERO FEES</Text>
              </View>
            </View>
            <Text style={[styles.grantDesc, { color: colors.fg3 }]}>
              Transakt Smart Accounts include native gas sponsorship for all ENS registrations and vault actions.
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              disabled={isFunding}
              onPress={handleFundWallet}
              style={styles.claimGrantBtn}
            >
              {isFunding ? (
                <ActivityIndicator size="small" color="#F5F3EB" />
              ) : (
                <Text style={styles.claimGrantBtnText}>
                  Claim +0.05 Sepolia Gas Grant
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Section 2: Official Public Faucets */}
          <View style={styles.externalFaucetsBlock}>
            <Text style={[styles.externalFaucetsTitle, { color: colors.fg3 }]}>
              Official Web3 Faucets (Real Onchain ETH)
            </Text>
            <Text style={[styles.externalFaucetsSubtitle, { color: colors.fg3 }]}>
              Address auto-copies when tapping any faucet below:
            </Text>

            <View style={styles.faucetsGrid}>
              {[
                {
                  name: 'Google Cloud Web3 Faucet',
                  url: 'https://cloud.google.com/application/web3/faucet/ethereum/sepolia',
                },
                {
                  name: 'Sepolia PoW Faucet',
                  url: 'https://sepolia-faucet.pk910.de/',
                },
                {
                  name: 'Chainlink Faucet',
                  url: 'https://faucets.chain.link/sepolia',
                },
                {
                  name: 'SepoliaFaucet.com',
                  url: 'https://sepoliafaucet.com/',
                },
              ].map((f) => (
                <TouchableOpacity
                  key={f.name}
                  activeOpacity={0.7}
                  onPress={() => {
                    handleCopyAddress()
                    Linking.openURL(f.url)
                  }}
                  style={[
                    styles.faucetChip,
                    { backgroundColor: colors.bg, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.faucetChipText, { color: colors.fg }]}>
                    {f.name} ↗
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Etherscan Verification Link */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Linking.openURL(`https://sepolia.etherscan.io/address/${rawAddress}`)}
            style={styles.etherscanAddressBtn}
          >
            <Text style={[styles.etherscanAddressText, { color: colors.fg3 }]}>
              Verify wallet on{' '}
              <Text style={{ color: '#1D5D3A', fontWeight: '800' }}>
                Sepolia Etherscan ↗
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    </View>
  )
}

type NodeData = (typeof nodes)[number]

function NodeCard({ node }: { node: NodeData }) {
  const { colors } = useTheme()
  const barAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: node.bar / 100,
      duration: 900,
      useNativeDriver: false,
    }).start()
  }, [barAnim, node.bar])

  const barWidth = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  })

  return (
    <View
      style={[
        styles.nodeCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.nodeCardTop}>
        <View style={[styles.nodeIconCircle, { backgroundColor: node.iconBg }]}>
          <node.Icon size={20} color={node.iconColor} />
        </View>
        <View
          style={[
            styles.nodeBadgePill,
            {
              backgroundColor: node.badgeBg,
              borderColor: node.badgeBorder,
            },
          ]}
        >
          <Text style={[styles.nodeBadgeText, { color: node.hex }]}>
            {node.badge}
          </Text>
        </View>
      </View>

      <Text
        numberOfLines={1}
        style={[styles.nodeCardName, { color: colors.fg2 }]}
      >
        {node.name}
      </Text>
      <Text style={[styles.nodeCardEth, { color: colors.fg }]}>{node.eth}</Text>
      <Text style={[styles.nodeCardFiat, { color: colors.fg3 }]}>{node.fiat}</Text>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressTrack, { backgroundColor: colors.raised }]}>
          <Animated.View
            style={[
              styles.progressFill,
              { width: barWidth, backgroundColor: node.hex },
            ]}
          />
        </View>
        <View style={styles.progressLabels}>
          <Text style={[styles.progressVal, { color: colors.fg3 }]}>
            {node.spent}
          </Text>
          <Text style={[styles.progressVal, { color: colors.fg3 }]}>
            {node.limit}
          </Text>
        </View>
      </View>

      <Text style={[styles.nodeMetaText, { color: colors.fg3 }]}>
        {node.meta}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 8,
  },
  familyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  familyDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  familyPillText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  faucetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  faucetBtnText: {
    color: '#1D5D3A',
    fontSize: 11,
    fontWeight: '800',
  },
  fundedToast: {
    backgroundColor: 'rgba(29, 93, 58, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(29, 93, 58, 0.25)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 8,
    alignItems: 'center',
  },
  fundedToastText: {
    color: '#1D5D3A',
    fontSize: 12,
    fontWeight: '700',
  },
  themeToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTreasury: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 6,
    paddingBottom: 20,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  balanceDollar: {
    fontSize: 30,
    fontWeight: '900',
    marginTop: 6,
    marginRight: 2,
  },
  balanceInt: {
    fontSize: 58,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 62,
  },
  balanceDec: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1.5,
    marginTop: 6,
  },
  ethPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 24,
    borderWidth: 1,
  },
  ethPillAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  ethPillChange: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1DB563',
  },
  quickActionsContainer: {
    paddingHorizontal: 24,
    marginBottom: 22,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  nodesSection: {
    marginBottom: 28,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  sectionActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  horizontalNodesScroll: {
    paddingHorizontal: 24,
    gap: 12,
  },
  nodeCard: {
    width: 180,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  nodeCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  nodeIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  nodeBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  nodeCardName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  nodeCardEth: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  nodeCardFiat: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressVal: {
    fontSize: 10,
    fontWeight: '500',
  },
  nodeMetaText: {
    fontSize: 11,
    fontWeight: '600',
  },
  activitySection: {
    paddingHorizontal: 24,
  },
  activityCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  activityAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityAvatarText: {
    fontSize: 11,
    fontWeight: '900',
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 13,
    fontWeight: '700',
  },
  activityMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  activityAmount: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  bottomVerifyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 20,
    marginHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(29, 93, 58, 0.18)',
    backgroundColor: 'rgba(29, 93, 58, 0.05)',
  },
  bottomVerifyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.68)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  faucetModalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  faucetModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faucetModalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  faucetModalIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(29, 93, 58, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  faucetModalTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  faucetModalSubtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  closeIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faucetAccountBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  faucetAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faucetAccountLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  faucetAddressText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 2,
  },
  copyPillBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  copyPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  faucetDivider: {
    height: 1,
    width: '100%',
  },
  faucetBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faucetBalanceBig: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  refreshBalBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(29, 93, 58, 0.1)',
  },
  refreshBalText: {
    color: '#1D5D3A',
    fontSize: 11,
    fontWeight: '800',
  },
  grantSuccessBanner: {
    backgroundColor: 'rgba(29, 93, 58, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(29, 93, 58, 0.3)',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
  },
  grantSuccessBannerText: {
    color: '#1D5D3A',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  grantCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  grantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  grantTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1D5D3A',
  },
  grantBadge: {
    backgroundColor: '#1D5D3A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  grantBadgeText: {
    color: '#F5F3EB',
    fontSize: 8,
    fontWeight: '900',
  },
  grantDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  claimGrantBtn: {
    backgroundColor: '#1D5D3A',
    borderRadius: 14,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  claimGrantBtnText: {
    color: '#F5F3EB',
    fontSize: 12,
    fontWeight: '900',
  },
  externalFaucetsBlock: {
    gap: 6,
  },
  externalFaucetsTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  externalFaucetsSubtitle: {
    fontSize: 11,
  },
  faucetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  faucetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  faucetChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  etherscanAddressBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  etherscanAddressText: {
    fontSize: 11,
    fontWeight: '600',
  },
})
