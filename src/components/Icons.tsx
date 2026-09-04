import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Svg, {
  Path,
  Rect,
  Circle,
  Line,
  Polyline,
  Polygon,
  Ellipse,
  G,
} from 'react-native-svg'

export interface IconProps {
  size?: number
  color?: string
}

export function IconCreditCard({ size = 20, color = '#1A1410' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="5" width="20" height="14" rx="3" stroke={color} strokeWidth="1.6" />
      <Path d="M2 10h20" stroke={color} strokeWidth="1.6" />
      <Rect x="5" y="14" width="4" height="2" rx="1" fill={color} opacity="0.6" />
      <Rect x="11" y="14" width="3" height="2" rx="1" fill={color} opacity="0.4" />
    </Svg>
  )
}

export function IconGradCap({ size = 20, color = '#1A1410' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M22 9L12 4L2 9L12 14L22 9Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <Path d="M6 11.5V17C6 17 8.5 19 12 19C15.5 19 18 17 18 17V11.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M22 9V14" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  )
}

export function IconRefresh({ size = 20, color = '#1A1410' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M3 3v5h5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

export function IconShield({ size = 16, color = '#1A1410' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L4 6V12C4 16.42 7.58 20.17 12 21C16.42 20.17 20 16.42 20 12V6L12 2Z"
        stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <Path d="M9 12L11 14L15 10" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

export function IconSun({ size = 16, color = '#1A1410' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.6" />
      <Path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  )
}

export function IconMoon({ size = 16, color = '#1A1410' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

export function IconBell({ size = 16, color = '#1A1410' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

export function IconCheck({ size = 12, color = '#1A1410' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <Path d="M2 6L4.5 8.5L10 3" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

export function IconChevronDown({ size = 12, color = '#1A1410' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <Path d="M2 4L6 8L10 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

export function IconArrowLeft({ size = 16, color = '#1A1410' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

export function IconUsers({ size = 18, color = '#1A1410' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="7" r="3" stroke={color} strokeWidth="1.6" />
      <Path d="M3 20C3 16.69 5.69 14 9 14" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <Circle cx="16" cy="14" r="3" stroke={color} strokeWidth="1.6" />
      <Path d="M13 20.5C13 18.57 14.34 17 16 17C17.66 17 19 18.57 19 20.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  )
}

export function IconSend({ size = 18, color = '#1A1410' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

export function IconRequest({ size = 18, color = '#1A1410' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v14M5 12l7 7 7-7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

export function IconCard({ size = 18, color = '#1A1410' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="5" width="20" height="14" rx="2" stroke={color} strokeWidth="1.6" />
      <Path d="M2 10h20" stroke={color} strokeWidth="1.6" />
      <Rect x="5" y="13.5" width="3" height="2" rx="0.5" fill={color} opacity={0.5} />
    </Svg>
  )
}

export function IconBackspace({ size = 20, color = '#1A1410' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 4H8L2 12L8 20H21V4Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <Path d="M15 9L10 14M10 9L15 14" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  )
}

export function IconNote({ size = 14, color = '#1A1410' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M14 2H6C5.45 2 5 2.45 5 3V21C5 21.55 5.45 22 6 22H18C18.55 22 19 21.55 19 21V7L14 2Z"
        stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <Path d="M14 2V7H19" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <Path d="M9 13h6M9 17h4" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  )
}

export function IconEdit({ size = 10, color = '#1A1410' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M11 4H4C3.45 4 3 4.45 3 5V20C3 20.55 3.45 21 4 21H19C19.55 21 20 20.55 20 20V13M18.59 2.59C19.37 1.81 20.63 1.81 21.41 2.59C22.19 3.37 22.19 4.63 21.41 5.41L12 15L8 16L9 12L18.59 2.59Z"
        stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

export function IconLock({ size = 8, color = '#1A1410' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth="2" />
      <Path d="M7 11V7C7 4.24 9.24 2 12 2C14.76 2 17 4.24 17 7V11" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  )
}

export function IconWarning({ size = 18, color = '#1A1410' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M10.29 3.86L1.82 18C1.64 18.33 1.64 18.73 1.82 19.06 2 19.39 2.35 19.6 2.73 19.6H21.27C21.65 19.6 22 19.39 22.18 19.06 22.36 18.73 22.36 18.33 22.18 18L13.71 3.86C13.53 3.53 13.18 3.32 12.8 3.32 12.42 3.32 12.07 3.53 11.89 3.86Z"
        stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <Line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <Line x1="12" y1="17" x2="12.01" y2="17" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  )
}

export function IconSearch({ size = 16, color = '#1A1410' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth="1.6" />
      <Path d="M21 21L16.65 16.65" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  )
}

export function IconX({ size = 14, color = '#1A1410' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 6L6 18M6 6L18 18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  )
}

export function IconSwap({ size = 22, color = '#1A1410' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 8h13M13 5l4 3-4 3" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M20 16H7M11 13l-4 3 4 3" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  )
}

export function EthDiamond({ size = 14, color = '#1A1410' }: IconProps) {
  return (
    <Svg width={size} height={size * 1.58} viewBox="0 0 24 38" fill="none">
      <Path d="M12 2 L2 18 L12 23 L22 18 Z" fill={color} opacity={0.85}/>
      <Path d="M2 20 L12 25 L22 20 L12 36 Z" fill={color} opacity={0.65}/>
      <Path d="M12 2 L2 18 L12 23 Z" fill={color} opacity={0.4}/>
    </Svg>
  )
}

export function PasskeyIcon({ size = 20, color = '#1A1410' }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Circle cx="7.5" cy="15.5" r="5.5" />
      <Path d="m21 2-9.6 9.6" />
      <Path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
    </Svg>
  )
}

export function MetaMaskIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path fill="#e17726" d="M23.205225 0.9874275 13.121575 8.448625l1.87515 -4.397125 8.2085 -3.0640725Z" strokeWidth={0.25} />
      <Path fill="#e27625" d="M0.818115 0.996155 9.00465 4.052l1.780525 4.454775L0.818115 0.996155Z" strokeWidth={0.25} />
      <Path fill="#e27625" d="m19.147225 16.855225 4.4568 0.084825 -1.5576 5.291375 -5.438275 -1.49735 2.539075 -3.87885Z" strokeWidth={0.25} />
      <Path fill="#e27625" d="m4.852525 16.855225 2.529675 3.878875 -5.429175 1.497425 -1.5481175 -5.291475 4.4476175 -0.084825Z" strokeWidth={0.25} />
      <Path fill="#e27625" d="m10.543275 7.372 0.1822 5.882675 -5.450075 -0.247975 1.550225 -2.33875 0.019625 -0.02255L10.543275 7.372Z" strokeWidth={0.25} />
      <Path fill="#e27625" d="m13.4003 7.30645 3.75445 3.33925 0.019425 0.022375 1.550275 2.33875 -5.448825 0.247925 0.124675 -5.9483Z" strokeWidth={0.25} />
      <Path fill="#e27625" d="m7.541775 16.87225 2.9759 2.318675 -3.456875 1.669025 0.480975 -3.9877Z" strokeWidth={0.25} />
      <Path fill="#e27625" d="m16.458725 16.871875 0.471 3.988075 -3.447175 -1.669175 2.976175 -2.3189Z" strokeWidth={0.25} />
      <Path fill="#d5bfb2" d="m13.558475 18.9724 3.4981 1.69385 -3.253925 1.546475 0.033775 -1.022125 -0.27795 -2.2182Z" strokeWidth={0.25} />
      <Path fill="#d5bfb2" d="m10.44055 18.97315 -0.26705 2.2007 0.0219 1.037625 -3.26155 -1.54525 3.5067 -1.693075Z" strokeWidth={0.25} />
      <Path fill="#233447" d="m9.430425 14.02245 0.914125 1.921125 -3.11225 -0.911675 2.198125 -1.00945Z" strokeWidth={0.25} />
      <Path fill="#233447" d="m14.56965 14.02265 2.20845 1.009175 -3.12235 0.91145 0.9139 -1.920625Z" strokeWidth={0.25} />
      <Path fill="#cc6228" d="m7.779875 16.852725 -0.5031 4.1345 -2.696325 -4.044125 3.199425 -0.090375Z" strokeWidth={0.25} />
      <Path fill="#cc6228" d="m16.22045 16.852775 3.199525 0.0904L16.7135 20.9874l-0.49305 -4.134625Z" strokeWidth={0.25} />
      <Path fill="#cc6228" d="m18.803175 12.773 -2.328475 2.37305 -1.795225 -0.820375 -0.85955 1.8069 -0.56345 -3.1072 5.5467 -0.252375Z" strokeWidth={0.25} />
      <Path fill="#cc6228" d="m5.19555 12.77295 5.547675 0.2524 -0.563475 3.107225 -0.8597 -1.8067 -1.785775 0.8202 -2.338725 -2.373125Z" strokeWidth={0.25} />
      <Path fill="#e27525" d="m5.038825 12.286075 2.6344 2.6732 0.0913 2.63905 -2.7257 -5.31225Z" strokeWidth={0.25} />
      <Path fill="#e27525" d="M18.963975 12.28125 16.2334 17.603l0.1028 -2.643775L18.963975 12.28125Z" strokeWidth={0.25} />
      <Path fill="#e27525" d="m10.6146 12.448725 0.106025 0.667375 0.262 1.6625 -0.168425 5.10625 -0.79635 -4.1019 -0.000275 -0.0424 0.597025 -3.291825Z" strokeWidth={0.25} />
      <Path fill="#e27525" d="m13.384 12.439575 0.5986 3.301025 -0.00025 0.0424 -0.79835 4.11215 -0.0316 -1.028525 -0.124575 -4.1182 0.356175 -2.30885Z" strokeWidth={0.25} />
      <Path fill="#f5841f" d="m16.5705 14.8529 -0.08915 2.2929 -2.77905 2.16525 -0.5618 -0.39695 0.62975 -3.243675 2.80025 -0.817525Z" strokeWidth={0.25} />
      <Path fill="#f5841f" d="m7.439075 14.852975 2.790625 0.817525 0.629725 3.243625 -0.561825 0.396925 -2.7792 -2.165425 -0.079325 -2.29265Z" strokeWidth={0.25} />
      <Path fill="#c0ac9d" d="m6.4021 20.15985 3.555475 1.68465 -0.01505 -0.719375L10.24 20.864h3.51895l0.30825 0.26025 -0.0227 0.718875 3.532925 -1.679025 -1.719125 1.420625L13.7795 23.0125H10.211525l-2.07745 -1.433625 -1.731975 -1.419025Z" strokeWidth={0.25} />
      <Path fill="#161616" d="m13.303775 18.748225 0.5027 0.3551 0.2946 2.35045 -0.426325 -0.36H10.326425l-0.418225 0.36725 0.284925 -2.357525 0.502875 -0.355275h2.607775Z" strokeWidth={0.25} />
      <Path fill="#763e1a" d="m22.539625 1.19397 1.2104 3.631255 -0.7559 3.67155 0.538275 0.41525 -0.728375 0.555725 0.547375 0.42275 -0.72485 0.660175 0.445025 0.322275 -1.181025 1.379325 -4.844125 -1.4104 -0.041975 -0.0225 -3.490775 -2.9447L22.539625 1.19397Z" strokeWidth={0.25} />
      <Path fill="#763e1a" d="M1.460435 1.19397 10.4864 7.874675l-3.49075 2.9447 -0.042 0.0225 -4.844145 1.4104 -1.181015 -1.379325 0.44467 -0.322025 -0.72453 -0.6604 0.5463775 -0.422325 -0.73926 -0.5573 0.55858 -0.4155L0.25 4.82535 1.460435 1.19397Z" strokeWidth={0.25} />
      <Path fill="#f5841f" d="m16.809475 10.533375 5.132675 1.49435 1.667525 5.1393 -4.39925 0 -3.031225 0.03825 2.204425 -4.296825 -1.57415 -2.375075Z" strokeWidth={0.25} />
      <Path fill="#f5841f" d="m7.19055 10.533375 -1.574425 2.375075 2.204725 4.296825 -3.029725 -0.03825H0.3996575l1.65816 -5.13925 5.1327325 -1.4944Z" strokeWidth={0.25} />
      <Path fill="#f5841f" d="m15.248075 4.026975 -1.43565 3.8774 -0.30465 5.238 -0.116575 1.64175 -0.00925 4.193975H10.617825l-0.008975 -4.1861 -0.11695 -1.651075 -0.3048 -5.23655 -1.4354 -3.8774h6.496375Z" strokeWidth={0.25} />
    </Svg>
  )
}

export function WalletConnectIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Circle cx="16" cy="16" r="16" fill="#3B99FC"/>
      <Path d="M9.6 12.8C13.1 9.3 18.9 9.3 22.4 12.8l.5.5c.2.2.2.5 0 .7l-1.4 1.4c-.1.1-.3.1-.4 0l-.7-.7c-2.5-2.5-6.3-2.5-8.8 0l-.8.8c-.1.1-.3.1-.4 0L9 14.1c-.2-.2-.2-.5 0-.7l.6-.6z" fill="white"/>
      <Path d="M24.6 15.1l1.3 1.3c.2.2.2.5 0 .7l-6 6c-.2.2-.5.2-.7 0l-4.2-4.2c-.05-.05-.15-.05-.2 0l-4.2 4.2c-.2.2-.5.2-.7 0l-6-6c-.2-.2-.2-.5 0-.7l1.3-1.3c.2-.2.5-.2.7 0l4.2 4.2c.05.05.15.05.2 0l4.2-4.2c.2-.2.5-.2.7 0l4.2 4.2c.05.05.15.05.2 0l4.2-4.2c.2-.2.6-.2.8 0z" fill="white"/>
    </Svg>
  )
}

export function UniswapBadge() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Svg width={14} height={14} viewBox="0 0 20 20" fill="none">
        <Path d="M12 1 L9.5 7 L14 7 Z" fill="#FF007A"/>
        <Path d="M14.5 6.5 L17 3.5 L16 8 Z" fill="#FF007A" opacity={0.85}/>
        <Ellipse cx="10" cy="13" rx="7" ry="6" fill="#FF007A"/>
        <Circle cx="12.5" cy="11.5" r="1.4" fill="white"/>
        <Circle cx="13.1" cy="11.1" r="0.5" fill="#CC0066"/>
        <Circle cx="6.5" cy="14.5" r="0.8" fill="#CC0066" opacity={0.7}/>
      </Svg>
      <Text style={{ fontSize: 10, fontWeight: '900', letterSpacing: 1.2, color: '#FF007A', opacity: 0.85 }}>
        via Uniswap V3
      </Text>
    </View>
  )
}

/* ── Token Logos ────────────────────────────────────────── */
export function EthSymbol({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Circle cx="16" cy="16" r="16" fill="#627EEA"/>
      <Path d="M16 6 L7 17 L16 21 L25 17 Z" fill="white" opacity={0.95}/>
      <Path d="M7 19 L16 23 L25 19 L16 28 Z" fill="white" opacity={0.8}/>
      <Path d="M16 6 L7 17 L16 21 Z" fill="white" opacity={0.35}/>
      <Path d="M7 19 L16 23 L16 28 Z" fill="white" opacity={0.3}/>
    </Svg>
  )
}

export function UsdcSymbol({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Circle cx="16" cy="16" r="16" fill="#2775CA"/>
      <Line x1="16" y1="7" x2="16" y2="25" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
      <Path d="M20.5 11C20.5 9 18.5 8 16 8C13 8 11 9.5 11 12C11 14.5 13.5 15.5 16 16.5C18.5 17.5 21 18.5 21 21C21 23.5 19 25 16 25C13 25 11 23.5 11 21.5"
        stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </Svg>
  )
}

export function UsdtSymbol({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Circle cx="16" cy="16" r="16" fill="#26A17B"/>
      <Rect x="7" y="9" width="18" height="3" rx="1.5" fill="white"/>
      <Rect x="14" y="12" width="4" height="8" rx="2" fill="white"/>
      <Rect x="9" y="22" width="14" height="2.5" rx="1.25" fill="white" opacity={0.75}/>
    </Svg>
  )
}

export function DaiSymbol({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Circle cx="16" cy="16" r="16" fill="#F5AC37"/>
      <Path d="M10 8 L10 24 M10 8 C21 8 23 11.5 23 16 C23 20.5 21 24 10 24"
        stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <Line x1="8" y1="13.5" x2="21" y2="13.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <Line x1="8" y1="18.5" x2="21" y2="18.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </Svg>
  )
}

export function WbtcSymbol({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Circle cx="16" cy="16" r="16" fill="#F7931A"/>
      <Rect x="9.5" y="8" width="3" height="16" rx="1.5" fill="white"/>
      <Path d="M12.5 8 C21 8 21 15.5 12.5 15.5" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <Path d="M12.5 15.5 C22 15.5 22 24 12.5 24" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <Line x1="11" y1="7" x2="16" y2="7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <Line x1="11" y1="25" x2="16" y2="25" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </Svg>
  )
}

export function EnsSymbol({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Circle cx="16" cy="16" r="16" fill="#5298FF"/>
      <Rect x="8" y="9" width="3" height="14" rx="1.5" fill="white"/>
      <Rect x="8" y="9" width="15" height="3" rx="1.5" fill="white"/>
      <Rect x="8" y="14.5" width="12" height="3" rx="1.5" fill="white"/>
      <Rect x="8" y="20" width="15" height="3" rx="1.5" fill="white"/>
    </Svg>
  )
}

export interface TokenItem {
  symbol: string
  name: string
  color: string
}

export function TokenLogo({ token, size = 36 }: { token: TokenItem; size?: number }) {
  const symbolMap: Record<string, React.ReactNode> = {
    ETH: <EthSymbol size={size} />,
    USDC: <UsdcSymbol size={size} />,
    USDT: <UsdtSymbol size={size} />,
    DAI: <DaiSymbol size={size} />,
    WBTC: <WbtcSymbol size={size} />,
    ENS: <EnsSymbol size={size} />,
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: token.color + '40',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {symbolMap[token.symbol] ?? (
        <View
          style={{
            width: size,
            height: size,
            backgroundColor: token.color,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{ fontSize: size * 0.28, fontWeight: '900', color: '#FFF' }}>
            {token.symbol.slice(0, 3)}
          </Text>
        </View>
      )}
    </View>
  )
}
