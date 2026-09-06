import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native'
import { useTheme } from '../ThemeContext'
import { useAuth } from '../AuthContext'
import { EthDiamond } from '../components/Icons'
import {
  getSepoliaBalance,
  getLiveAssetTransfers,
  OnchainTransfer,
  isValidEthereumAddress,
} from '../services/alchemyFaucetService'

const filterOptions = ['All', 'Incoming', 'Outgoing', 'External', 'ERC20']

export default function ActivityTab() {
  const { colors } = useTheme()
  const { user } = useAuth()
  const [filter, setFilter] = useState('All')
  const [liveBalance, setLiveBalance] = useState<number | null>(null)
  const [liveTransfers, setLiveTransfers] = useState<OnchainTransfer[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const rawAddress =
    user?.address && isValidEthereumAddress(user.address)
      ? user.address
      : '0x71C8a27B2f90A2E80562eA9b294D0A38e83f3F9E'

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    Promise.all([
      getSepoliaBalance(rawAddress),
      getLiveAssetTransfers(rawAddress),
    ])
      .then(([bal, transfers]) => {
        if (isMounted) {
          setLiveBalance(bal)
          setLiveTransfers(transfers)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [rawAddress])

  const totalIn = liveTransfers.filter((i) => i.direction === 'in').length
  const totalOut = liveTransfers.filter((i) => i.direction === 'out').length

  const filteredTransfers = liveTransfers.filter((t) => {
    if (filter === 'All') return true
    if (filter === 'Incoming') return t.direction === 'in'
    if (filter === 'Outgoing') return t.direction === 'out'
    if (filter === 'External') return t.category === 'external'
    if (filter === 'ERC20') return t.category === 'erc20'
    return true
  })

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.fg }]}>Activity</Text>

        {/* Summary row */}
        <View style={styles.summaryRow}>
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: colors.fg3 }]}>
              Received
            </Text>
            <Text style={[styles.summaryValue, { color: '#1DB563' }]}>
              +{totalIn} txns
            </Text>
          </View>

          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: colors.fg3 }]}>
              Sent
            </Text>
            <Text style={[styles.summaryValue, { color: colors.fg }]}>
              {totalOut} txns
            </Text>
          </View>

          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: colors.fg3 }]}>
              Live Balance
            </Text>
            <Text style={[styles.summaryValue, { color: colors.accent }]}>
              {liveBalance !== null ? `${liveBalance.toFixed(3)} ETH` : '0.000 ETH'}
            </Text>
          </View>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {filterOptions.map((f) => {
            const isSelected = filter === f

            return (
              <TouchableOpacity
                key={f}
                activeOpacity={0.8}
                onPress={() => setFilter(f)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected ? colors.accent : colors.surface,
                    borderColor: isSelected ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    {
                      color: isSelected ? colors.accentFg : colors.fg2,
                      fontWeight: isSelected ? '800' : '600',
                    },
                  ]}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      {/* Transaction List */}
      <View style={styles.groupContainer}>
        <View style={styles.groupBlock}>
          <Text style={[styles.groupLabel, { color: colors.fg3 }]}>
            Onchain Transactions
          </Text>

          <View
            style={[
              styles.groupCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {isLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color="#1D5D3A" />
                <Text style={[styles.loadingText, { color: colors.fg3 }]}>
                  Loading live onchain transactions...
                </Text>
              </View>
            ) : filteredTransfers.length > 0 ? (
              filteredTransfers.map((item, i) => {
                const isIncoming = item.direction === 'in'
                const displayAddr = isIncoming ? item.from : item.to
                const shortAddr = displayAddr
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
                      styles.itemRow,
                      {
                        borderBottomColor: colors.border,
                        borderBottomWidth:
                          i < filteredTransfers.length - 1 ? 1 : 0,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.itemAvatar,
                        {
                          backgroundColor: isIncoming
                            ? 'rgba(29, 181, 99, 0.12)'
                            : 'rgba(239, 68, 68, 0.12)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.itemAvatarText,
                          { color: isIncoming ? '#1DB563' : '#EF4444' },
                        ]}
                      >
                        {isIncoming ? '↓' : '↑'}
                      </Text>
                    </View>

                    <View style={styles.itemInfo}>
                      <Text
                        numberOfLines={1}
                        style={[styles.itemName, { color: colors.fg }]}
                      >
                        {isIncoming ? `From: ${shortAddr}` : `To: ${shortAddr}`}
                      </Text>
                      <View style={styles.itemMetaRow}>
                        <Text
                          numberOfLines={1}
                          style={[styles.itemNote, { color: colors.fg2 }]}
                        >
                          Block #{parseInt(item.blockNum, 16)}
                        </Text>
                        <View
                          style={[
                            styles.catBadge,
                            {
                              backgroundColor: 'rgba(29, 93, 58, 0.10)',
                              borderColor: 'rgba(29, 93, 58, 0.22)',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.catBadgeText,
                              { color: '#1D5D3A' },
                            ]}
                          >
                            {item.category.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.itemAmounts}>
                      <Text
                        style={[
                          styles.amountText,
                          { color: isIncoming ? '#1DB563' : colors.fg },
                        ]}
                      >
                        {isIncoming ? '+' : '-'}
                        {item.value.toFixed(4)} {item.asset}
                      </Text>
                      <Text style={[styles.itemTime, { color: colors.fg3 }]}>
                        Verified ↗
                      </Text>
                    </View>
                  </TouchableOpacity>
                )
              })
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyTitle, { color: colors.fg }]}>
                  No Transactions Found
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.fg3 }]}>
                  No onchain transactions recorded for this wallet address yet.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    Linking.openURL(`https://sepolia.etherscan.io/address/${rawAddress}`)
                  }
                  style={[styles.verifyAddressBtn, { borderColor: colors.border }]}
                >
                  <Text style={[styles.verifyAddressBtnText, { color: colors.accent }]}>
                    View Address on Etherscan ↗
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
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
            Verify All Activity on Etherscan ↗
          </Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '900',
  },
  filterScroll: {
    gap: 8,
    paddingTop: 4,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
  },
  groupContainer: {
    paddingHorizontal: 24,
  },
  groupBlock: {
    marginBottom: 20,
  },
  groupLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  groupCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  loadingBox: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  itemAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemAvatarText: {
    fontSize: 14,
    fontWeight: '900',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  itemNote: {
    fontSize: 11,
  },
  catBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  catBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  itemAmounts: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  itemTime: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  emptySubtitle: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 260,
  },
  verifyAddressBtn: {
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  verifyAddressBtnText: {
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
    marginTop: 10,
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
