import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import Svg, { Path, Rect, Circle, Polyline } from 'react-native-svg'
import { Tab } from '../App'
import { useTheme } from '../ThemeContext'

interface NavTabItem {
  id: Tab
  label: string
  renderIcon: (active: boolean, color: string) => React.ReactElement
}

const navTabs: NavTabItem[] = [
  {
    id: 'home',
    label: 'HOME',
    renderIcon: (active, color) => (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path
          d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
          fill={active ? color : 'none'}
          stroke={color}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      </Svg>
    ),
  },
  {
    id: 'send',
    label: 'SEND',
    renderIcon: (active, color) => (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path
          d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"
          stroke={color}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
  },
  {
    id: 'activity',
    label: 'ACTIVITY',
    renderIcon: (active, color) => (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Polyline
          points="22,12 18,12 15,21 9,3 6,12 2,12"
          stroke={color}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
  },
  {
    id: 'permissions',
    label: 'MANAGE',
    renderIcon: (active, color) => (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Rect x={3} y={11} width={18} height={11} rx={2} stroke={color} strokeWidth={1.6} />
        <Path
          d="M7 11V7C7 4.24 9.24 2 12 2C14.76 2 17 4.24 17 7V11"
          stroke={color}
          strokeWidth={1.6}
          strokeLinecap="round"
        />
        <Circle cx={12} cy={16} r={1.5} fill={color} />
      </Svg>
    ),
  },
]

export default function NavBar({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab
  onTabChange: (t: Tab) => void
}) {
  const { colors } = useTheme()

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      <View style={styles.navRow}>
        {navTabs.map(({ id, label, renderIcon }) => {
          const isActive = activeTab === id
          const iconColor = isActive ? colors.accent : colors.fg3

          return (
            <TouchableOpacity
              key={id}
              activeOpacity={0.7}
              onPress={() => onTabChange(id)}
              style={styles.tabButton}
            >
              {renderIcon(isActive, iconColor)}
              <Text
                style={[
                  styles.tabLabel,
                  { color: iconColor },
                  isActive && styles.activeTabLabel,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingTop: 8,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    gap: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  activeTabLabel: {
    fontWeight: '900',
  },
})
