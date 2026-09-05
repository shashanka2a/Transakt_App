import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
} from 'react-native'
import { Tab } from '../App'
import { useTheme } from '../ThemeContext'
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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
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
            smithfam.eth
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

      {/* Hero Treasury Balance */}
      <View style={styles.heroTreasury}>
        <Text style={[styles.heroLabel, { color: colors.fg3 }]}>
          Family Treasury
        </Text>

        <View style={styles.balanceRow}>
          <Text style={[styles.balanceDollar, { color: colors.fg3 }]}>$</Text>
          <Text style={[styles.balanceInt, { color: colors.fg }]}>1,420</Text>
          <Text style={[styles.balanceDec, { color: colors.fg3 }]}>.50</Text>
        </View>

        {/* ETH Pill */}
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
            0.45 ETH
          </Text>
          <Text style={styles.ethPillChange}>+4.2%</Text>
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
    </ScrollView>
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
})
