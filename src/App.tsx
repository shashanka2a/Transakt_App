import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  StatusBar,
} from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { ThemeProvider, useTheme } from './ThemeContext'
import { AuthProvider, useAuth } from './AuthContext'
import LoadingScreen from './screens/LoadingScreen'
import WelcomeScreen from './screens/WelcomeScreen'
import ENSSearchScreen from './screens/ENSSearchScreen'
import ENSDashboardScreen from './screens/ENSDashboardScreen'
import HomeTab from './tabs/HomeTab'
import SendTab from './tabs/SendTab'
import BiometricModal from './tabs/BiometricModal'
import PermissionsTab from './tabs/PermissionsTab'
import ActivityTab from './tabs/ActivityTab'
import RequestModal from './tabs/RequestModal'
import SwapModal from './tabs/SwapModal'
import NavBar from './components/NavBar'

export type Tab = 'home' | 'send' | 'permissions' | 'activity'
type AppFlow = 'loading' | 'welcome' | 'ens-search' | 'ens-dashboard' | 'app'

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}

function AppShell() {
  const { theme, colors, isDark } = useTheme()
  const [flow, setFlow] = useState<AppFlow>('loading')
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [showBio, setShowBio] = useState(false)
  const [showRequest, setShowRequest] = useState(false)
  const [showSwap, setShowSwap] = useState(false)

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.container, { backgroundColor: colors.bg }]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
      />

      {/* ── Loading Overlay ── */}
      {flow === 'loading' && (
        <LoadingScreen onDone={() => setFlow('welcome')} />
      )}

      {/* ── Onboarding Flows ── */}
      {flow === 'welcome' && (
        <WelcomeScreen onContinue={() => setFlow('ens-search')} />
      )}

      {flow === 'ens-search' && (
        <ENSSearchScreen onPurchase={() => setFlow('ens-dashboard')} />
      )}

      {flow === 'ens-dashboard' && (
        <ENSDashboardScreen onEnterApp={() => setFlow('app')} />
      )}

      {/* ── Main App Navigation & Tabs ── */}
      {flow === 'app' && (
        <View style={styles.appWrapper}>
          <View style={styles.tabContent}>
            {activeTab === 'home' && (
              <HomeTab
                onNavigate={setActiveTab}
                onOpenRequest={() => setShowRequest(true)}
                onOpenSwap={() => setShowSwap(true)}
              />
            )}
            {activeTab === 'send' && (
              <SendTab
                onReview={() => setShowBio(true)}
                onBack={() => setActiveTab('home')}
              />
            )}
            {activeTab === 'permissions' && <PermissionsTab />}
            {activeTab === 'activity' && <ActivityTab />}
          </View>

          {/* Bottom Tab Bar */}
          <NavBar activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Interactive Modals */}
          {showBio && (
            <BiometricModal
              onClose={() => setShowBio(false)}
              onConfirm={() => {
                setShowBio(false)
                setActiveTab('home')
              }}
            />
          )}

          {showRequest && <RequestModal onClose={() => setShowRequest(false)} />}
          {showSwap && <SwapModal onClose={() => setShowSwap(false)} />}
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appWrapper: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
})
