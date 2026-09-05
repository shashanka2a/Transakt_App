import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Linking,
} from 'react-native'
import Svg, { Path } from 'react-native-svg'
import {
  IconCreditCard,
  IconGradCap,
  IconRefresh,
  IconBell,
  IconChevronDown,
  IconSun,
  IconMoon,
  EthDiamond,
} from '../components/Icons'
import { useTheme } from '../ThemeContext'
import { useAuth } from '../AuthContext'
import IssueSubnameModal from './IssueSubnameModal'
import {
  getSepoliaBalance,
  watchSepoliaBalance,
  isValidEthereumAddress,
} from '../services/alchemyFaucetService'

interface Props {
  onEnterApp: () => void
}

const subnodes = [
  {
    id: 'pay',
    ens: 'pay.smithfam.eth',
    label: 'Daily Pocket',
    eth: '0.12 ETH',
    fiat: '$342.80',
    badge: 'ACTIVE',
    hex: '#00FF87',
    Icon: IconCreditCard,
    iconBg: 'rgba(0,255,135,0.12)',
    iconColor: '#00FF87',
    holder: 'Alex · Teen',
  },
  {
    id: 'vault',
    ens: 'vault.smithfam.eth',
    label: 'Savings',
    eth: '1.20 ETH',
    fiat: '$3,428.00',
    badge: 'LOCKED',
    hex: '#FFB830',
    Icon: IconGradCap,
    iconBg: 'rgba(255,184,48,0.12)',
    iconColor: '#FFB830',
    holder: 'Parent Controlled',
  },
  {
    id: 'allow',
    ens: 'allow.smithfam.eth',
    label: 'Allowance',
    eth: '0.04 ETH',
    fiat: '$114.27',
    badge: 'AUTO',
    hex: '#8E95A5',
    Icon: IconRefresh,
    iconBg: 'rgba(142,149,165,0.12)',
    iconColor: '#8E95A5',
    holder: 'Auto-refill · Monthly',
  },
]

export default function ENSDashboardScreen({ onEnterApp }: Props) {
  const { theme, colors, toggle } = useTheme()
  const { user } = useAuth()
  const [showIssue, setShowIssue] = useState(false)
  const [dropdown, setDropdown] = useState(false)
  const [liveBalance, setLiveBalance] = useState<number | null>(null)

  const rawAddress =
    user?.address && isValidEthereumAddress(user.address)
      ? user.address
      : '0x71C8a27B2f90A2E80562eA9b294D0A38e83f3F9E'
  const activeEns = user?.ensName || 'smithfam.eth'

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

  const effectiveEth = liveBalance !== null && liveBalance > 0 ? liveBalance : 0.45
  const ethPriceUsd = 3240.50
  const totalUsd = (effectiveEth * ethPriceUsd).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Nav */}
        <View style={styles.topNav}>
          <View style={styles.navLeft}>
            <View style={styles.avatarWrapper}>
              <View style={[styles.avatarCircle, { backgroundColor: '#00FF87' }]}>
                <Text style={styles.avatarLetter}>
                  {activeEns.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View
                style={[
                  styles.avatarCheckBadge,
                  { backgroundColor: colors.accent, borderColor: colors.bg },
                ]}
              >
                <Svg width={7} height={7} viewBox="0 0 10 10" fill="none">
                  <Path
                    d="M2 5L4 7L8 3"
                    stroke={colors.accentFg}
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setDropdown(!dropdown)}
              style={[
                styles.accountButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.accountButtonText, { color: colors.fg }]}>
                ${activeEns}
              </Text>
              <View style={{ transform: [{ rotate: dropdown ? '180deg' : '0deg' }] }}>
                <IconChevronDown color={colors.fg3} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.navRight}>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={toggle}
              style={[
                styles.iconButton,
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
            <TouchableOpacity
              activeOpacity={0.75}
              style={[
                styles.iconButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <IconBell size={15} color={colors.fg2} />
              <View
                style={[
                  styles.notifDot,
                  { backgroundColor: colors.accent, borderColor: colors.surface },
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Treasury */}
        <View style={styles.heroSection}>
          <Text style={[styles.heroLabel, { color: colors.fg3 }]}>
            Family Treasury
          </Text>
          <Text style={[styles.heroAmount, { color: colors.fg }]}>
            ${totalUsd}
          </Text>
          <Text style={[styles.heroSubtext, { color: colors.fg2 }]}>
            {effectiveEth.toFixed(4)} ETH · Sepolia Live · {activeEns}
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onEnterApp}
            style={[
              styles.openDashboardButton,
              {
                backgroundColor: colors.accent,
              },
            ]}
          >
            <Text style={[styles.openDashboardText, { color: colors.accentFg }]}>
              Open Full Dashboard
            </Text>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path
                d="M5 12h14M13 6l6 6-6 6"
                stroke={colors.accentFg}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Nodes & Sub-Accounts */}
        <View style={styles.nodesSection}>
          <View style={styles.nodesHeaderRow}>
            <Text style={[styles.nodesSectionTitle, { color: colors.fg3 }]}>
              Nodes & Sub-Accounts
            </Text>
            <View
              style={[
                styles.ensv2Tag,
                { backgroundColor: 'rgba(29, 93, 58, 0.18)', borderColor: '#1D5D3A' },
              ]}
            >
              <Text style={[styles.ensv2TagText, { color: colors.accent }]}>
                ENSv2 Sepolia Beta
              </Text>
            </View>
          </View>

          <View style={styles.nodesList}>
            {subnodes.map((node) => (
              <View
                key={node.id}
                style={[
                  styles.nodeCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                {/* Accent top bar */}
                <View style={[styles.nodeAccentBar, { backgroundColor: node.hex }]} />

                <View style={styles.nodeInner}>
                  <View
                    style={[
                      styles.nodeIconBox,
                      { backgroundColor: node.iconBg },
                    ]}
                  >
                    <node.Icon size={20} color={node.iconColor} />
                  </View>

                  <View style={styles.nodeDetails}>
                    <View style={styles.nodeTitleRow}>
                      <Text style={[styles.nodeLabel, { color: colors.fg }]}>
                        {node.label}
                      </Text>
                      <View
                        style={[
                          styles.nodeBadge,
                          {
                            backgroundColor: node.hex + '18',
                            borderColor: node.hex + '44',
                          },
                        ]}
                      >
                        <Text style={[styles.nodeBadgeText, { color: node.hex }]}>
                          {node.badge}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.nodeEns, { color: colors.fg2 }]}>
                      {node.ens}
                    </Text>
                    <Text style={[styles.nodeHolder, { color: colors.fg3 }]}>
                      {node.holder}
                    </Text>
                  </View>

                  <View style={styles.nodeValues}>
                    <Text style={[styles.nodeEth, { color: colors.fg }]}>
                      {node.eth}
                    </Text>
                    <Text style={[styles.nodeFiat, { color: colors.fg2 }]}>
                      {node.fiat}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Issue New Subname CTA */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowIssue(true)}
            style={[
              styles.issueCtaButton,
              {
                borderColor: colors.border2,
              },
            ]}
          >
            <View
              style={[
                styles.issueIconCircle,
                {
                  backgroundColor: colors.mt10,
                  borderColor: colors.mb20,
                },
              ]}
            >
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 5v14M5 12h14"
                  stroke={colors.accent}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
            </View>
            <View style={styles.issueTexts}>
              <Text style={[styles.issueTitle, { color: colors.fg }]}>
                Issue New Subname
              </Text>
              <Text style={[styles.issueSubtitle, { color: colors.fg3 }]}>
                Add a family member to your node
              </Text>
            </View>
          </TouchableOpacity>

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
                Verify Onchain Activity on Etherscan ↗
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Issue Modal */}
      {showIssue && <IssueSubnameModal onClose={() => setShowIssue(false)} />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 16,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0D0E11',
  },
  avatarCheckBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  accountButtonText: {
    fontSize: 13,
    fontWeight: '900',
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroAmount: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1.5,
    marginBottom: 4,
  },
  heroSubtext: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 20,
  },
  openDashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  openDashboardText: {
    fontSize: 14,
    fontWeight: '800',
  },
  nodesSection: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  nodesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  nodesSectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  ensv2Tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  ensv2TagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  nodesList: {
    gap: 12,
    marginBottom: 16,
  },
  nodeCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  nodeAccentBar: {
    height: 2,
    opacity: 0.6,
  },
  nodeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  nodeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeDetails: {
    flex: 1,
  },
  nodeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  nodeLabel: {
    fontSize: 14,
    fontWeight: '900',
  },
  nodeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  nodeBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  nodeEns: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  nodeHolder: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  nodeValues: {
    alignItems: 'flex-end',
  },
  nodeEth: {
    fontSize: 14,
    fontWeight: '900',
  },
  nodeFiat: {
    fontSize: 12,
    fontWeight: '500',
  },
  issueCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  issueIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  issueTexts: {
    flex: 1,
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  issueSubtitle: {
    fontSize: 12,
  },
  bottomVerifyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 18,
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
