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
} from '../components/Icons'
import {
  getSepoliaBalance,
  watchSepoliaBalance,
  getLiveAssetTransfers,
  OnchainTransfer,
  isValidEthereumAddress,
} from '../services/alchemyFaucetService'

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
  const [liveTransfers, setLiveTransfers] = useState<OnchainTransfer[]>([])
  const [isLoadingTransfers, setIsLoadingTransfers] = useState(false)

  const rawAddress =
    user?.address && isValidEthereumAddress(user.address)
      ? user.address
      : '0x71C8a27B2f90A2E80562eA9b294D0A38e83f3F9E'
  const activeEns = user?.ensName || 'smithfam.eth'

  // 1. Fetch actual live onchain balance
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

  // 2. Fetch actual live onchain transactions
  useEffect(() => {
    let isMounted = true
    setIsLoadingTransfers(true)

    getLiveAssetTransfers(rawAddress)
      .then((transfers) => {
        if (isMounted) {
          setLiveTransfers(transfers)
          setIsLoadingTransfers(false)
        }
      })
      .catch(() => {
        if (isMounted) setIsLoadingTransfers(false)
      })

    return () => {
      isMounted = false
    }
  }, [rawAddress])

  // Calculate actual live USD treasury
  const actualEth = liveBalance !== null ? liveBalance : 0
  const ethPriceUsd = 3240.50
  const totalUsd = actualEth * ethPriceUsd
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

        {/* Hero Treasury Balance (Actual Live Balance) */}
        <View style={styles.heroTreasury}>
          <Text style={[styles.heroLabel, { color: colors.fg3 }]}>
            Family Treasury
          </Text>

          <View style={styles.balanceRow}>
            <Text style={[styles.balanceDollar, { color: colors.fg3 }]}>$</Text>
            <Text style={[styles.balanceInt, { color: colors.fg }]}>{usdInt}</Text>
            <Text style={[styles.balanceDec, { color: colors.fg3 }]}>.{usdDec}</Text>
          </View>

          {/* Clean ETH Pill */}
          <View
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
              {actualEth.toFixed(4)} ETH
            </Text>
          </View>
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

        {/* Recent Activity (Actual Live Transactions) */}
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
            {isLoadingTransfers ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#1D5D3A" />
                <Text style={[styles.loadingText, { color: colors.fg3 }]}>
                  Syncing onchain transactions...
                </Text>
              </View>
            ) : liveTransfers.length > 0 ? (
              liveTransfers.slice(0, 4).map((item, i) => {
                const isIncoming = item.direction === 'in'
                const displayAddr = isIncoming ? item.from : item.to
                const shortCounterparty = displayAddr
                  ? `${displayAddr.slice(0, 6)}...${displayAddr.slice(-4)}`
                  : 'Contract'

                return (
                  <TouchableOpacity
                    key={item.hash + i}
                    activeOpacity={0.7}
                    onPress={() =>
                      Linking.openURL(`https://sepolia.etherscan.io/tx/${item.hash}`)
                    }
                    style={[
                      styles.activityRow,
                      {
                        borderBottomColor: colors.border,
                        borderBottomWidth:
                          i < Math.min(liveTransfers.length, 4) - 1 ? 1 : 0,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.activityAvatar,
                        {
                          backgroundColor: isIncoming
                            ? 'rgba(29, 181, 99, 0.12)'
                            : 'rgba(239, 68, 68, 0.12)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.activityAvatarText,
                          { color: isIncoming ? '#1DB563' : '#EF4444' },
                        ]}
                      >
                        {isIncoming ? '↓' : '↑'}
                      </Text>
                    </View>

                    <View style={styles.activityInfo}>
                      <Text
                        numberOfLines={1}
                        style={[styles.activityName, { color: colors.fg }]}>
                        {isIncoming
                          ? `Received from ${shortCounterparty}`
                          : `Sent to ${shortCounterparty}`}
                      </Text>
                      <Text style={[styles.activityMeta, { color: colors.fg2 }]}>
                        {item.category.toUpperCase()} · Block #{parseInt(item.blockNum, 16)}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.activityAmount,
                        { color: isIncoming ? '#1DB563' : colors.fg },
                      ]}
                    >
                      {isIncoming ? '+' : '-'}
                      {item.value.toFixed(4)} {item.asset}
                    </Text>
                  </TouchableOpacity>
                )
              })
            ) : (
              <View style={styles.emptyActivityContainer}>
                <Text style={[styles.emptyActivityTitle, { color: colors.fg }]}>
                  No Recent Transactions
                </Text>
                <Text style={[styles.emptyActivitySubtitle, { color: colors.fg3 }]}>
                  All onchain deposits, transfers, and family treasury operations will appear here in real-time.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    Linking.openURL(`https://sepolia.etherscan.io/address/${rawAddress}`)
                  }
                  style={[styles.emptyVerifyBtn, { borderColor: colors.border }]}
                >
                  <Text style={[styles.emptyVerifyBtnText, { color: colors.accent }]}>
                    View Address on Etherscan ↗
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
            Ethereum Network ·{' '}
            <Text style={{ color: '#1D5D3A', fontWeight: '700' }}>
              Verify Transactions on Etherscan ↗
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '600',
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
    fontSize: 14,
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
  emptyActivityContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyActivityTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  emptyActivitySubtitle: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 260,
  },
  emptyVerifyBtn: {
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  emptyVerifyBtnText: {
    fontSize: 11,
    fontWeight: '700',
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
})
