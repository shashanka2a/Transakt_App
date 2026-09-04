import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Animated,
  ActivityIndicator,
  Platform,
} from 'react-native'
import Svg, { Path, Circle } from 'react-native-svg'
import { TokenLogo, UniswapBadge } from '../components/Icons'
import { useTheme } from '../ThemeContext'

interface Props {
  onClose: () => void
}

export interface Token {
  symbol: string
  name: string
  balance: string
  balanceUsd: string
  price: number
  color: string
}

export const TOKENS: Token[] = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    balance: '0.087',
    balanceUsd: '281.88',
    price: 3240,
    color: '#627EEA',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    balance: '142.50',
    balanceUsd: '142.50',
    price: 1,
    color: '#2775CA',
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    balance: '0.00',
    balanceUsd: '0.00',
    price: 1,
    color: '#26A17B',
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    balance: '58.20',
    balanceUsd: '58.20',
    price: 1,
    color: '#F5AC37',
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    balance: '0.0012',
    balanceUsd: '67.70',
    price: 56400,
    color: '#F7931A',
  },
  {
    symbol: 'ENS',
    name: 'Ethereum Name Svc',
    balance: '12.00',
    balanceUsd: '144.00',
    price: 12,
    color: '#5298FF',
  },
]

type SwapState = 'idle' | 'reviewing' | 'swapping' | 'done'

export default function SwapModal({ onClose }: Props) {
  const { colors } = useTheme()
  const [fromToken, setFromToken] = useState<Token>(TOKENS[0]) // ETH
  const [toToken, setToToken] = useState<Token>(TOKENS[1]) // USDC
  const [fromAmt, setFromAmt] = useState('')
  const [slippage, setSlippage] = useState(0.5)
  const [showSlip, setShowSlip] = useState(false)
  const [picker, setPicker] = useState<'from' | 'to' | null>(null)
  const [swapState, setSwapState] = useState<SwapState>('idle')

  const fromNum = parseFloat(fromAmt) || 0
  const rate = fromToken.price / toToken.price
  const toAmt =
    fromNum > 0
      ? (fromNum * rate).toFixed(toToken.price >= 1000 ? 6 : 2)
      : ''
  const usdValue = (fromNum * fromToken.price).toFixed(2)
  const impact =
    fromNum * fromToken.price > 5000
      ? 'HIGH'
      : fromNum * fromToken.price > 1000
      ? 'MED'
      : 'LOW'
  const impactColor =
    impact === 'HIGH' ? '#FF4757' : impact === 'MED' ? '#D4900A' : '#1DB563'
  const fee = (fromNum * fromToken.price * 0.003).toFixed(4)
  const minReceived = toAmt
    ? (parseFloat(toAmt) * (1 - slippage / 100)).toFixed(
        toToken.price >= 1000 ? 6 : 2
      )
    : ''
  const hasBalance = fromNum > 0 && fromNum <= parseFloat(fromToken.balance)
  const canSwap = fromNum > 0 && hasBalance && swapState === 'idle'

  const flip = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmt(toAmt)
  }

  const handleSwap = () => {
    setSwapState('reviewing')
  }

  const confirmSwap = () => {
    setSwapState('swapping')
    setTimeout(() => setSwapState('done'), 2200)
  }

  const setMax = () => setFromAmt(fromToken.balance)

  const append = (v: string) => {
    if (v === '.' && fromAmt.includes('.')) return
    if (v === 'DEL') {
      setFromAmt((a) => a.slice(0, -1))
      return
    }
    setFromAmt((a) => (a === '0' && v !== '.' ? v : a + v))
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={
            swapState === 'idle' || swapState === 'reviewing' ? onClose : undefined
          }
        />

        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
            },
          ]}
        >
          {/* Handle */}
          <View style={[styles.sheetHandle, { backgroundColor: colors.border2 }]} />

          <ScrollView
            style={styles.sheetScroll}
            contentContainerStyle={styles.sheetScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* IDLE / INPUT State */}
            {(swapState === 'idle' || swapState === 'reviewing') && (
              <>
                {/* Header */}
                <View style={styles.headerRow}>
                  <View>
                    <Text style={[styles.headerTitle, { color: colors.fg }]}>
                      Swap
                    </Text>
                    <UniswapBadge />
                  </View>
                  <View style={styles.headerActions}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setShowSlip((s) => !s)}
                      style={[
                        styles.slippageBtn,
                        {
                          backgroundColor: colors.raised,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                        <Circle cx="12" cy="12" r="3" stroke={colors.fg3} strokeWidth="1.8" />
                        <Path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke={colors.fg3} strokeWidth="1.5" strokeLinecap="round" />
                      </Svg>
                      <Text style={[styles.slippageText, { color: colors.fg2 }]}>
                        {slippage}%
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={onClose}
                      style={[
                        styles.closeBtn,
                        {
                          backgroundColor: colors.raised,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M18 6L6 18M6 6l12 12"
                          stroke={colors.fg2}
                          strokeWidth={2}
                          strokeLinecap="round"
                        />
                      </Svg>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Slippage Panel */}
                {showSlip && (
                  <View
                    style={[
                      styles.slippagePanel,
                      {
                        backgroundColor: colors.raised,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.slippagePanelTitle, { color: colors.fg3 }]}>
                      Slippage Tolerance
                    </Text>
                    <View style={styles.slippageButtonsRow}>
                      {[0.1, 0.5, 1.0, 3.0].map((v) => (
                        <TouchableOpacity
                          key={v}
                          activeOpacity={0.8}
                          onPress={() => {
                            setSlippage(v)
                            setShowSlip(false)
                          }}
                          style={[
                            styles.slippageOption,
                            {
                              backgroundColor:
                                slippage === v ? colors.accent : colors.surface,
                              borderColor:
                                slippage === v ? colors.accent : colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.slippageOptionText,
                              {
                                color:
                                  slippage === v ? colors.accentFg : colors.fg2,
                              },
                            ]}
                          >
                            {v}%
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* FROM Token Block */}
                <View
                  style={[
                    styles.tokenBlock,
                    {
                      backgroundColor: colors.raised,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.tokenBlockTop}>
                    <Text style={[styles.tokenBlockLabel, { color: colors.fg3 }]}>
                      You pay
                    </Text>
                    <View style={styles.tokenBlockBalanceRow}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={setMax}
                        style={[
                          styles.maxPill,
                          {
                            backgroundColor: colors.mt10,
                            borderColor: colors.mb20,
                          },
                        ]}
                      >
                        <Text style={[styles.maxText, { color: colors.accent }]}>
                          MAX
                        </Text>
                      </TouchableOpacity>
                      <Text style={[styles.balanceText, { color: colors.fg3 }]}>
                        Bal: {fromToken.balance} {fromToken.symbol}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.tokenBlockMain}>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.amountInputText,
                          {
                            color: colors.fg,
                            opacity: fromAmt ? 1 : 0.35,
                          },
                        ]}
                      >
                        {fromAmt || '0'}
                      </Text>
                      {fromNum > 0 && (
                        <Text style={[styles.approxUsd, { color: colors.fg3 }]}>
                          ≈ ${usdValue}
                        </Text>
                      )}
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setPicker('from')}
                      style={[
                        styles.pickerPill,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <TokenLogo token={fromToken} size={28} />
                      <Text style={[styles.pickerSymbol, { color: colors.fg }]}>
                        {fromToken.symbol}
                      </Text>
                      <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M6 9l6 6 6-6"
                          stroke={colors.fg3}
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Flip Button */}
                <View style={styles.flipWrapper}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={flip}
                    style={[
                      styles.flipButton,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M12 5v14M8 15l4 4 4-4M8 9l4-4 4 4"
                        stroke={colors.fg2}
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </TouchableOpacity>
                </View>

                {/* TO Token Block */}
                <View
                  style={[
                    styles.tokenBlock,
                    {
                      backgroundColor: colors.raised,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.tokenBlockTop}>
                    <Text style={[styles.tokenBlockLabel, { color: colors.fg3 }]}>
                      You receive
                    </Text>
                    <Text style={[styles.balanceText, { color: colors.fg3 }]}>
                      Bal: {toToken.balance} {toToken.symbol}
                    </Text>
                  </View>

                  <View style={styles.tokenBlockMain}>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.amountInputText,
                          {
                            color: colors.fg,
                            opacity: toAmt ? 1 : 0.35,
                          },
                        ]}
                      >
                        {toAmt || '0'}
                      </Text>
                      {toAmt.length > 0 && (
                        <Text style={[styles.approxUsd, { color: colors.fg3 }]}>
                          ≈ ${(parseFloat(toAmt) * toToken.price).toFixed(2)}
                        </Text>
                      )}
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setPicker('to')}
                      style={[
                        styles.pickerPill,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <TokenLogo token={toToken} size={28} />
                      <Text style={[styles.pickerSymbol, { color: colors.fg }]}>
                        {toToken.symbol}
                      </Text>
                      <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M6 9l6 6 6-6"
                          stroke={colors.fg3}
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Rate Info */}
                {fromNum > 0 && toAmt.length > 0 && (
                  <View
                    style={[
                      styles.rateCard,
                      {
                        backgroundColor: colors.raised,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.rateRow}>
                      <Text style={[styles.rateLabel, { color: colors.fg3 }]}>
                        Rate
                      </Text>
                      <Text style={[styles.rateVal, { color: colors.fg }]}>
                        1 {fromToken.symbol} = {rate.toFixed(4)} {toToken.symbol}
                      </Text>
                    </View>

                    <View style={styles.rateRow}>
                      <Text style={[styles.rateLabel, { color: colors.fg3 }]}>
                        Price impact
                      </Text>
                      <Text style={[styles.rateVal, { color: impactColor }]}>
                        {impact === 'LOW'
                          ? '< 0.01%'
                          : impact === 'MED'
                          ? '~0.5%'
                          : '~2.1%'}
                      </Text>
                    </View>

                    <View style={styles.rateRow}>
                      <Text style={[styles.rateLabel, { color: colors.fg3 }]}>
                        Min received
                      </Text>
                      <Text style={[styles.rateVal, { color: colors.fg }]}>
                        {minReceived} {toToken.symbol}
                      </Text>
                    </View>

                    <View style={styles.rateRow}>
                      <Text style={[styles.rateLabel, { color: colors.fg3 }]}>
                        Network fee
                      </Text>
                      <Text style={[styles.rateVal, { color: '#1DB563' }]}>
                        ~${fee} · Sponsored
                      </Text>
                    </View>
                  </View>
                )}

                {/* Custom Numpad */}
                <View style={styles.numpadGrid}>
                  {[
                    '1',
                    '2',
                    '3',
                    '4',
                    '5',
                    '6',
                    '7',
                    '8',
                    '9',
                    '.',
                    '0',
                    'DEL',
                  ].map((k) => (
                    <TouchableOpacity
                      key={k}
                      activeOpacity={0.7}
                      onPress={() => append(k)}
                      style={[
                        styles.numpadKey,
                        {
                          backgroundColor:
                            k === 'DEL' ? colors.raised : colors.bg,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.numpadKeyText, { color: colors.fg }]}>
                        {k === 'DEL' ? '⌫' : k}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* CTA */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={!canSwap}
                  onPress={handleSwap}
                  style={[
                    styles.swapCtaBtn,
                    {
                      backgroundColor: canSwap ? colors.accent : colors.raised,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.swapCtaBtnText,
                      { color: canSwap ? colors.accentFg : colors.fg3 },
                    ]}
                  >
                    {!fromNum
                      ? 'Enter amount'
                      : !hasBalance
                      ? `Insufficient ${fromToken.symbol}`
                      : 'Review Swap'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* REVIEW STATE */}
            {swapState === 'reviewing' && (
              <View>
                <View style={styles.reviewHeader}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setSwapState('idle')}
                    style={[
                      styles.backIconBtn,
                      {
                        backgroundColor: colors.raised,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M19 12H5M11 6l-6 6 6 6"
                        stroke={colors.fg2}
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </TouchableOpacity>
                  <Text style={[styles.reviewTitle, { color: colors.fg }]}>
                    Review Swap
                  </Text>
                </View>

                <View
                  style={[
                    styles.reviewSummaryCard,
                    {
                      backgroundColor: colors.raised,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.reviewTokensRow}>
                    <View style={styles.tokenReviewItem}>
                      <TokenLogo token={fromToken} size={38} />
                      <View style={{ marginLeft: 10 }}>
                        <Text style={[styles.reviewAmount, { color: colors.fg }]}>
                          {fromAmt}
                        </Text>
                        <Text style={[styles.reviewSub, { color: colors.fg3 }]}>
                          {fromToken.symbol} · ${usdValue}
                        </Text>
                      </View>
                    </View>

                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M5 12h14M13 6l6 6-6 6"
                        stroke="#FF007A"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>

                    <View style={styles.tokenReviewItem}>
                      <TokenLogo token={toToken} size={38} />
                      <View style={{ marginLeft: 10 }}>
                        <Text style={[styles.reviewAmount, { color: colors.fg }]}>
                          {toAmt}
                        </Text>
                        <Text style={[styles.reviewSub, { color: colors.fg3 }]}>
                          {toToken.symbol}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={[styles.reviewDivider, { backgroundColor: colors.border }]} />

                  <View style={styles.reviewDetailsList}>
                    {[
                      { label: 'Slippage', value: `${slippage}%` },
                      {
                        label: 'Min received',
                        value: `${minReceived} ${toToken.symbol}`,
                      },
                      { label: 'Network fee', value: `~$${fee} · Sponsored` },
                      { label: 'Protocol fee', value: '0.3% (Uniswap V3)' },
                    ].map((r) => (
                      <View key={r.label} style={styles.reviewDetailRow}>
                        <Text style={[styles.reviewDetailLabel, { color: colors.fg3 }]}>
                          {r.label}
                        </Text>
                        <Text style={[styles.reviewDetailVal, { color: colors.fg2 }]}>
                          {r.value}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={confirmSwap}
                  style={[
                    styles.swapCtaBtn,
                    { backgroundColor: colors.accent, marginTop: 16 },
                  ]}
                >
                  <Text style={[styles.swapCtaBtnText, { color: colors.accentFg }]}>
                    Confirm Swap
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* SWAPPING STATE */}
            {swapState === 'swapping' && (
              <View style={styles.swappingCenter}>
                <ActivityIndicator size="large" color="#FF007A" style={{ marginBottom: 16 }} />
                <Text style={[styles.swappingTitle, { color: colors.fg }]}>
                  Swapping
                </Text>
                <Text style={[styles.swappingDesc, { color: colors.fg2 }]}>
                  {fromAmt} {fromToken.symbol} → {toAmt} {toToken.symbol}
                </Text>
                <Text style={[styles.swappingNote, { color: colors.fg3 }]}>
                  Signing with Passkey · Broadcasting to Ethereum
                </Text>
              </View>
            )}

            {/* DONE STATE */}
            {swapState === 'done' && (
              <View style={styles.swappingCenter}>
                <View
                  style={[
                    styles.doneCheckCircle,
                    {
                      backgroundColor: colors.mt16,
                      borderColor: colors.accent,
                    },
                  ]}
                >
                  <Svg width={36} height={36} viewBox="0 0 36 36" fill="none">
                    <Path
                      d="M8 18L14 24L28 10"
                      stroke={colors.accent}
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>

                <Text style={[styles.swappingTitle, { color: colors.fg }]}>
                  Swap Complete!
                </Text>
                <Text style={[styles.swappingDesc, { color: colors.fg2 }]}>
                  {fromAmt} {fromToken.symbol} → {toAmt} {toToken.symbol}
                </Text>

                <View
                  style={[
                    styles.confirmedBadge,
                    {
                      backgroundColor: colors.mt10,
                      borderColor: colors.mb20,
                    },
                  ]}
                >
                  <View style={[styles.confirmedDot, { backgroundColor: colors.accent }]} />
                  <Text style={[styles.confirmedBadgeText, { color: colors.accent }]}>
                    CONFIRMED ON-CHAIN
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={onClose}
                  style={[
                    styles.swapCtaBtn,
                    { backgroundColor: colors.accent, marginTop: 24, width: '100%' },
                  ]}
                >
                  <Text style={[styles.swapCtaBtnText, { color: colors.accentFg }]}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Token Picker Sub-Modal */}
      {picker && (
        <TokenPickerModal
          current={picker === 'from' ? fromToken : toToken}
          exclude={picker === 'from' ? toToken : fromToken}
          onPick={(t) => {
            if (picker === 'from') setFromToken(t)
            else setToToken(t)
            setPicker(null)
          }}
          onClose={() => setPicker(null)}
        />
      )}
    </Modal>
  )
}

function TokenPickerModal({
  current,
  exclude,
  onPick,
  onClose,
}: {
  current: Token
  exclude: Token
  onPick: (t: Token) => void
  onClose: () => void
}) {
  const { colors } = useTheme()
  const [query, setQuery] = useState('')

  const filtered = TOKENS.filter(
    (t) =>
      t.symbol !== exclude.symbol &&
      (t.symbol.toLowerCase().includes(query.toLowerCase()) ||
        t.name.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          style={[
            styles.pickerSheet,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
            },
          ]}
        >
          <View style={[styles.sheetHandle, { backgroundColor: colors.border2 }]} />

          <View style={styles.pickerHeader}>
            <Text style={[styles.pickerTitle, { color: colors.fg }]}>
              Select Token
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={[
                styles.closeBtn,
                {
                  backgroundColor: colors.raised,
                  borderColor: colors.border,
                },
              ]}
            >
              <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18 6L6 18M6 6l12 12"
                  stroke={colors.fg2}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View
            style={[
              styles.pickerSearchRow,
              {
                backgroundColor: colors.raised,
                borderColor: colors.border,
              },
            ]}
          >
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search token…"
              placeholderTextColor={colors.fg3}
              style={[styles.pickerSearchInput, { color: colors.fg }]}
              autoFocus
            />
          </View>

          <ScrollView
            style={styles.pickerListScroll}
            showsVerticalScrollIndicator={false}
          >
            {filtered.map((t) => {
              const isSelected = t.symbol === current.symbol

              return (
                <TouchableOpacity
                  key={t.symbol}
                  activeOpacity={0.75}
                  onPress={() => onPick(t)}
                  style={[
                    styles.tokenRowItem,
                    {
                      backgroundColor: isSelected ? colors.mt10 : 'transparent',
                      borderColor: isSelected ? colors.mb20 : 'transparent',
                    },
                  ]}
                >
                  <TokenLogo token={t} size={36} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.tokenRowSymbol, { color: colors.fg }]}>
                      {t.symbol}
                    </Text>
                    <Text style={[styles.tokenRowName, { color: colors.fg3 }]}>
                      {t.name}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.tokenRowBal, { color: colors.fg }]}>
                      {t.balance}
                    </Text>
                    <Text style={[styles.tokenRowUsd, { color: colors.fg3 }]}>
                      ${t.balanceUsd}
                    </Text>
                  </View>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    maxHeight: '94%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  sheetScroll: {
    paddingHorizontal: 20,
  },
  sheetScrollContent: {
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slippageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  slippageText: {
    fontSize: 11,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slippagePanel: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
  },
  slippagePanelTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  slippageButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  slippageOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  slippageOptionText: {
    fontSize: 12,
    fontWeight: '800',
  },
  tokenBlock: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  tokenBlockTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tokenBlockLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  tokenBlockBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  maxPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  maxText: {
    fontSize: 9,
    fontWeight: '900',
  },
  balanceText: {
    fontSize: 11,
  },
  tokenBlockMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  amountInputText: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  approxUsd: {
    fontSize: 12,
    marginTop: 2,
  },
  pickerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  pickerSymbol: {
    fontSize: 14,
    fontWeight: '900',
  },
  flipWrapper: {
    alignItems: 'center',
    marginVertical: -8,
    zIndex: 10,
  },
  flipButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  rateCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 12,
    gap: 8,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rateLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  rateVal: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  numpadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 14,
  },
  numpadKey: {
    width: '31%',
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numpadKeyText: {
    fontSize: 18,
    fontWeight: '800',
  },
  swapCtaBtn: {
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  swapCtaBtnText: {
    fontSize: 16,
    fontWeight: '900',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  backIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  reviewSummaryCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  reviewTokensRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tokenReviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewAmount: {
    fontSize: 18,
    fontWeight: '900',
  },
  reviewSub: {
    fontSize: 11,
  },
  reviewDivider: {
    height: 1,
    marginVertical: 14,
  },
  reviewDetailsList: {
    gap: 8,
  },
  reviewDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewDetailLabel: {
    fontSize: 11,
  },
  reviewDetailVal: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  swappingCenter: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  swappingTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  swappingDesc: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  swappingNote: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
  doneCheckCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
  },
  confirmedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  confirmedBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  pickerSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    maxHeight: '75%',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 14,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  pickerSearchRow: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  pickerSearchInput: {
    fontSize: 14,
    fontWeight: '600',
  },
  pickerListScroll: {
    maxHeight: 320,
  },
  tokenRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 4,
  },
  tokenRowSymbol: {
    fontSize: 14,
    fontWeight: '900',
  },
  tokenRowName: {
    fontSize: 11,
  },
  tokenRowBal: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  tokenRowUsd: {
    fontSize: 10,
  },
})
