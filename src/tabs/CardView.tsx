import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native'
import Svg, { Rect, Path, Circle } from 'react-native-svg'
import { IconX } from '../components/Icons'
import { useTheme } from '../ThemeContext'

interface Props {
  onClose: () => void
}

type CardTab = 'details' | 'transactions' | 'limits'

const txns = [
  {
    name: 'Blue Bottle Coffee',
    time: 'Today 9:14 AM',
    amount: '-$8.50',
    category: 'Food & Drink',
  },
  {
    name: 'Spotify Premium',
    time: 'Yesterday',
    amount: '-$9.99',
    category: 'Subscriptions',
  },
  {
    name: "Trader Joe's",
    time: 'Mon 6:42 PM',
    amount: '-$43.21',
    category: 'Groceries',
  },
  {
    name: 'Netflix',
    time: 'Sun 12:00 AM',
    amount: '-$15.49',
    category: 'Subscriptions',
  },
  {
    name: 'Amazon',
    time: 'Fri 3:29 PM',
    amount: '-$67.00',
    category: 'Shopping',
  },
]

export default function CardView({ onClose }: Props) {
  const { colors } = useTheme()
  const [frozen, setFrozen] = useState(false)
  const [tab, setTab] = useState<CardTab>('details')
  const [showNum, setShowNum] = useState(false)
  const [spendLimit, setSpendLimit] = useState(500)

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.fg }]}>
            Transakt Card
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.fg2 }]}>
            Virtual Debit · Visa
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onClose}
          style={[
            styles.closeBtn,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <IconX size={16} color={colors.fg2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Virtual Card Face */}
        <View
          style={[
            styles.cardFace,
            {
              backgroundColor: frozen ? '#1C1F26' : '#0D1F15',
            },
          ]}
        >
          {/* Card Top */}
          <View style={styles.cardFaceTop}>
            <View>
              <Text style={styles.cardBrand}>TRANSAKT</Text>
              <View style={styles.cardStatusRow}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: frozen ? '#5A6070' : '#00FF87' },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: frozen ? '#5A6070' : '#00FF87' },
                  ]}
                >
                  {frozen ? 'FROZEN' : 'ACTIVE'}
                </Text>
              </View>
            </View>

            {/* Chip */}
            <View style={styles.cardChip}>
              <View style={styles.cardChipInner} />
            </View>
          </View>

          {/* Card Number */}
          <View style={styles.cardCenter}>
            <Text style={styles.cardNumber}>
              {showNum
                ? '4242  4242  4242  4242'
                : '••••  ••••  ••••  4242'}
            </Text>
          </View>

          {/* Card Bottom */}
          <View style={styles.cardFaceBottom}>
            <View>
              <Text style={styles.cardMetaLabel}>CARD HOLDER</Text>
              <Text style={styles.cardHolderName}>ALEX SMITH</Text>
            </View>
            <View>
              <Text style={styles.cardMetaLabel}>EXPIRES</Text>
              <Text style={styles.cardExpiry}>08 / 28</Text>
            </View>
            <Text style={styles.visaLogo}>VISA</Text>
          </View>

          {/* Frozen Overlay */}
          {frozen && (
            <View style={styles.frozenOverlay}>
              <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                <Rect x="3" y="11" width="18" height="11" rx="3" stroke="#FFF" strokeWidth="1.8" />
                <Path d="M7 11V7C7 4.24 9.24 2 12 2C14.76 2 17 4.24 17 7V11" stroke="#FFF" strokeWidth="1.8" strokeLinecap="round" />
              </Svg>
              <Text style={styles.frozenOverlayText}>CARD FROZEN</Text>
            </View>
          )}
        </View>

        {/* Quick Actions Row */}
        <View style={styles.quickActionsRow}>
          {[
            {
              label: frozen ? 'Unfreeze' : 'Freeze',
              color: frozen ? colors.accent : '#FF4757',
              icon: (
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Rect x="3" y="11" width="18" height="11" rx="2" stroke={frozen ? colors.accent : '#FF4757'} strokeWidth="1.6" />
                  <Path d="M7 11V7C7 4.24 9.24 2 12 2C14.76 2 17 4.24 17 7V11" stroke={frozen ? colors.accent : '#FF4757'} strokeWidth="1.6" strokeLinecap="round" />
                </Svg>
              ),
              onPress: () => setFrozen(!frozen),
            },
            {
              label: showNum ? 'Hide' : 'Reveal',
              color: colors.fg2,
              icon: (
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke={colors.fg2} strokeWidth="1.6" strokeLinejoin="round" />
                  <Circle cx="12" cy="12" r="3" stroke={colors.fg2} strokeWidth="1.6" />
                </Svg>
              ),
              onPress: () => setShowNum(!showNum),
            },
            {
              label: 'Copy',
              color: colors.fg2,
              icon: (
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Rect x="9" y="9" width="13" height="13" rx="2" stroke={colors.fg2} strokeWidth="1.6" />
                  <Path d="M5 15H4C3.45 15 3 14.55 3 14V4C3 3.45 3.45 3 4 3H14C14.55 3 15 3.45 15 4V5" stroke={colors.fg2} strokeWidth="1.6" strokeLinecap="round" />
                </Svg>
              ),
              onPress: () => {},
            },
            {
              label: 'Apple Pay',
              color: colors.fg2,
              icon: (
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="12" r="10" stroke={colors.fg2} strokeWidth="1.6" />
                  <Path d="M8 12h8M12 8v8" stroke={colors.fg2} strokeWidth="1.6" strokeLinecap="round" />
                </Svg>
              ),
              onPress: () => {},
            },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              activeOpacity={0.8}
              onPress={action.onPress}
              style={[
                styles.actionBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              {action.icon}
              <Text style={[styles.actionBtnText, { color: action.color }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Switcher */}
        <View
          style={[
            styles.tabSwitcher,
            {
              backgroundColor: colors.raised,
              borderColor: colors.border,
            },
          ]}
        >
          {(['details', 'transactions', 'limits'] as CardTab[]).map((t) => {
            const isSelected = tab === t

            return (
              <TouchableOpacity
                key={t}
                activeOpacity={0.8}
                onPress={() => setTab(t)}
                style={[
                  styles.subTabButton,
                  isSelected && [
                    styles.subTabButtonActive,
                    { backgroundColor: colors.surface },
                  ],
                ]}
              >
                <Text
                  style={[
                    styles.subTabText,
                    {
                      color: isSelected ? colors.fg : colors.fg3,
                      fontWeight: isSelected ? '800' : '600',
                    },
                  ]}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* ── DETAILS TAB ── */}
        {tab === 'details' && (
          <View style={styles.detailsList}>
            {[
              { label: 'Card Type', value: 'Virtual Debit · Visa' },
              { label: 'Currency', value: 'USD / USDC' },
              { label: 'Linked to', value: 'alex.smith.fam.eth' },
              { label: 'Issued', value: 'August 2024' },
              { label: '3D Secure', value: 'Enabled', accent: true },
              { label: 'Notifications', value: 'All transactions', accent: true },
            ].map((row) => (
              <View
                key={row.label}
                style={[
                  styles.detailCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.detailLabel, { color: colors.fg2 }]}>
                  {row.label}
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: row.accent ? colors.accent : colors.fg },
                  ]}
                >
                  {row.value}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ── TRANSACTIONS TAB ── */}
        {tab === 'transactions' && (
          <View
            style={[
              styles.txnsContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {txns.map((tx, i) => (
              <View
                key={tx.name}
                style={[
                  styles.txnRow,
                  {
                    borderBottomColor: colors.border,
                    borderBottomWidth: i < txns.length - 1 ? 1 : 0,
                  },
                ]}
              >
                <View
                  style={[
                    styles.txnIcon,
                    { backgroundColor: colors.raised },
                  ]}
                >
                  <Text style={[styles.txnLetter, { color: colors.fg2 }]}>
                    {tx.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.txnInfo}>
                  <Text style={[styles.txnName, { color: colors.fg }]}>
                    {tx.name}
                  </Text>
                  <View style={styles.txnMetaRow}>
                    <Text style={[styles.txnTime, { color: colors.fg3 }]}>
                      {tx.time}
                    </Text>
                    <View
                      style={[
                        styles.txnCatPill,
                        { backgroundColor: colors.raised },
                      ]}
                    >
                      <Text style={[styles.txnCatText, { color: colors.fg3 }]}>
                        {tx.category}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={[styles.txnAmount, { color: colors.fg }]}>
                  {tx.amount}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ── LIMITS TAB ── */}
        {tab === 'limits' && (
          <View style={styles.limitsContainer}>
            {/* Spend Meter */}
            <View
              style={[
                styles.spendMeterCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.spendMeterHeader}>
                <View>
                  <Text style={[styles.spendMeterLabel, { color: colors.fg2 }]}>
                    Monthly Spend
                  </Text>
                  <Text style={[styles.spendMeterAmount, { color: colors.fg }]}>
                    $144.19
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.spendLimitLabel, { color: colors.fg3 }]}>
                    Limit
                  </Text>
                  <Text style={[styles.spendLimitValue, { color: colors.fg2 }]}>
                    ${spendLimit}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.spendProgressBar,
                  { backgroundColor: colors.raised },
                ]}
              >
                <View
                  style={[
                    styles.spendProgressFill,
                    {
                      width: `${Math.min((144.19 / spendLimit) * 100, 100)}%`,
                      backgroundColor:
                        144.19 / spendLimit > 0.8 ? '#FF4757' : colors.accent,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.spendRemainingText, { color: colors.fg3 }]}>
                ${(spendLimit - 144.19).toFixed(2)} remaining this month
              </Text>
            </View>

            {/* Stepper for Limit */}
            <View
              style={[
                styles.stepperCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.stepperHeader}>
                <Text style={[styles.stepperTitle, { color: colors.fg }]}>
                  Adjust Monthly Limit
                </Text>
                <Text style={[styles.stepperAmount, { color: colors.accent }]}>
                  ${spendLimit}
                </Text>
              </View>

              <View style={styles.stepperButtonsRow}>
                {[-100, -50, +50, +100].map((delta) => (
                  <TouchableOpacity
                    key={delta}
                    activeOpacity={0.7}
                    onPress={() =>
                      setSpendLimit((prev) =>
                        Math.max(200, Math.min(2000, prev + delta))
                      )
                    }
                    style={[
                      styles.stepperBtn,
                      {
                        backgroundColor: colors.raised,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.stepperBtnText, { color: colors.fg }]}>
                      {delta > 0 ? `+${delta}` : delta}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {[
              { label: 'Per Transaction Limit', value: '$200.00' },
              { label: 'International Payments', value: 'Disabled', danger: true },
              { label: 'Online Purchases', value: 'Enabled', accent: true },
              { label: 'Contactless Payments', value: 'Enabled', accent: true },
            ].map((row) => (
              <View
                key={row.label}
                style={[
                  styles.detailCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.detailLabel, { color: colors.fg2 }]}>
                  {row.label}
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    {
                      color: row.danger
                        ? '#FF4757'
                        : row.accent
                        ? colors.accent
                        : colors.fg,
                    },
                  ]}
                >
                  {row.value}
                </Text>
              </View>
            ))}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  cardFace: {
    height: 200,
    borderRadius: 24,
    padding: 20,
    justifyContent: 'space-between',
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  cardFaceTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardBrand: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.6)',
  },
  cardStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  cardChip: {
    width: 36,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#D4AF37',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    overflow: 'hidden',
  },
  cardChipInner: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    borderRadius: 4,
    margin: 2,
  },
  cardCenter: {
    marginVertical: 4,
  },
  cardNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 3,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  cardFaceBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  cardMetaLabel: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardHolderName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  cardExpiry: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  visaLogo: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  frozenOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  frozenOverlayText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  tabSwitcher: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  subTabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 14,
  },
  subTabButtonActive: {
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  subTabText: {
    fontSize: 12,
  },
  detailsList: {
    gap: 10,
  },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  txnsContainer: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  txnIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnLetter: {
    fontSize: 14,
    fontWeight: '900',
  },
  txnInfo: {
    flex: 1,
  },
  txnName: {
    fontSize: 13,
    fontWeight: '700',
  },
  txnMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  txnTime: {
    fontSize: 11,
  },
  txnCatPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  txnCatText: {
    fontSize: 9,
    fontWeight: '700',
  },
  txnAmount: {
    fontSize: 13,
    fontWeight: '800',
  },
  limitsContainer: {
    gap: 12,
  },
  spendMeterCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  spendMeterHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  spendMeterLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  spendMeterAmount: {
    fontSize: 24,
    fontWeight: '900',
  },
  spendLimitLabel: {
    fontSize: 11,
  },
  spendLimitValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  spendProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  spendProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  spendRemainingText: {
    fontSize: 11,
  },
  stepperCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  stepperHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stepperTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  stepperAmount: {
    fontSize: 14,
    fontWeight: '900',
  },
  stepperButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  stepperBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  stepperBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
})
