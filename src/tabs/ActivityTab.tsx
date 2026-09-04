import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native'
import { useTheme } from '../ThemeContext'

interface ActivityItem {
  id: number
  name: string
  note: string
  time: string
  amount: string
  pos: boolean
  initials: string
  hue: number
  category: 'Family' | 'DeFi' | 'NFT'
}

interface ActivityGroup {
  label: string
  items: ActivityItem[]
}

const groups: ActivityGroup[] = [
  {
    label: 'Today',
    items: [
      {
        id: 1,
        name: '$mom.smith.fam.eth',
        note: 'Weekly transfer',
        time: '2h ago',
        amount: '+0.04 ETH',
        pos: true,
        initials: 'MS',
        hue: 150,
        category: 'Family',
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
        category: 'DeFi',
      },
    ],
  },
  {
    label: 'Yesterday',
    items: [
      {
        id: 3,
        name: '$dad.smith.fam.eth',
        note: 'Allowance payout',
        time: '1d ago',
        amount: '+0.015 ETH',
        pos: true,
        initials: 'DS',
        hue: 150,
        category: 'Family',
      },
      {
        id: 4,
        name: 'OpenSea',
        note: 'NFT mint · Azuki #44',
        time: '1d ago',
        amount: '-0.08 ETH',
        pos: false,
        initials: 'OS',
        hue: 210,
        category: 'NFT',
      },
    ],
  },
  {
    label: 'This Week',
    items: [
      {
        id: 5,
        name: '$college.vault',
        note: 'Auto-deposit',
        time: '2d ago',
        amount: '+0.20 ETH',
        pos: true,
        initials: 'CV',
        hue: 40,
        category: 'Family',
      },
      {
        id: 6,
        name: 'Aave V3',
        note: 'USDC deposit',
        time: '2d ago',
        amount: '-150 USDC',
        pos: false,
        initials: 'AV',
        hue: 190,
        category: 'DeFi',
      },
      {
        id: 7,
        name: '$allowance.node',
        note: 'Weekly chore payout',
        time: '3d ago',
        amount: '+0.025 ETH',
        pos: true,
        initials: 'AN',
        hue: 150,
        category: 'Family',
      },
      {
        id: 8,
        name: 'Mirror.xyz',
        note: 'Article NFT collect',
        time: '4d ago',
        amount: '-0.05 ETH',
        pos: false,
        initials: 'MX',
        hue: 270,
        category: 'NFT',
      },
    ],
  },
]

const filterOptions = ['All', 'Incoming', 'Outgoing', 'Family', 'DeFi', 'NFT']

export default function ActivityTab() {
  const { colors } = useTheme()
  const [filter, setFilter] = useState('All')

  const allItems = groups.flatMap((g) => g.items)
  const filtered = groups
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => {
        if (filter === 'All') return true
        if (filter === 'Incoming') return item.pos
        if (filter === 'Outgoing') return !item.pos
        if (filter === 'Family') return item.category === 'Family'
        if (filter === 'DeFi') return item.category === 'DeFi'
        if (filter === 'NFT') return item.category === 'NFT'
        return true
      }),
    }))
    .filter((g) => g.items.length > 0)

  const totalIn = allItems.filter((i) => i.pos).length
  const totalOut = allItems.filter((i) => !i.pos).length

  const getCategoryBadgeStyle = (cat: string) => {
    if (cat === 'Family') {
      return {
        color: '#1DB563',
        bg: 'rgba(29,181,99,0.10)',
        border: 'rgba(29,181,99,0.22)',
      }
    }
    if (cat === 'DeFi') {
      return {
        color: '#5B8EF4',
        bg: 'rgba(91,142,244,0.10)',
        border: 'rgba(91,142,244,0.22)',
      }
    }
    if (cat === 'NFT') {
      return {
        color: '#A855F7',
        bg: 'rgba(168,85,247,0.10)',
        border: 'rgba(168,85,247,0.22)',
      }
    }
    return {
      color: colors.fg3,
      bg: colors.raised,
      border: colors.border,
    }
  }

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
                    backgroundColor: isSelected
                      ? colors.accent
                      : colors.surface,
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

      {/* Grouped Activity List */}
      <View style={styles.groupContainer}>
        {filtered.map((group) => (
          <View key={group.label} style={styles.groupBlock}>
            <Text style={[styles.groupLabel, { color: colors.fg3 }]}>
              {group.label}
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
              {group.items.map((item, i) => {
                const catStyle = getCategoryBadgeStyle(item.category)

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.itemRow,
                      {
                        borderBottomColor: colors.border,
                        borderBottomWidth:
                          i < group.items.length - 1 ? 1 : 0,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.itemAvatar,
                        {
                          backgroundColor: `hsl(${item.hue}, 30%, 88%)`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.itemAvatarText,
                          { color: `hsl(${item.hue}, 45%, 28%)` },
                        ]}
                      >
                        {item.initials}
                      </Text>
                    </View>

                    <View style={styles.itemInfo}>
                      <Text
                        numberOfLines={1}
                        style={[styles.itemName, { color: colors.fg }]}
                      >
                        {item.name}
                      </Text>
                      <View style={styles.itemMetaRow}>
                        <Text
                          numberOfLines={1}
                          style={[styles.itemNote, { color: colors.fg2 }]}
                        >
                          {item.note}
                        </Text>
                        <View
                          style={[
                            styles.catBadge,
                            {
                              backgroundColor: catStyle.bg,
                              borderColor: catStyle.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.catBadgeText,
                              { color: catStyle.color },
                            ]}
                          >
                            {item.category}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.itemAmounts}>
                      <Text
                        style={[
                          styles.amountText,
                          { color: item.pos ? '#1DB563' : colors.fg },
                        ]}
                      >
                        {item.amount}
                      </Text>
                      <Text style={[styles.itemTime, { color: colors.fg3 }]}>
                        {item.time}
                      </Text>
                    </View>
                  </View>
                )
              })}
            </View>
          </View>
        ))}
      </View>
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
    gap: 12,
    marginBottom: 18,
  },
  summaryCard: {
    flex: 1,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  filterScroll: {
    gap: 8,
    paddingBottom: 4,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
  },
  groupContainer: {
    paddingHorizontal: 24,
    gap: 20,
  },
  groupBlock: {
    gap: 8,
  },
  groupLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  groupCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
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
    fontSize: 11,
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
    gap: 6,
    marginTop: 2,
  },
  itemNote: {
    fontSize: 11,
    flexShrink: 1,
  },
  catBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
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
    marginTop: 2,
  },
})
