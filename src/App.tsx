import React, { useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  StatusBar,
} from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { AuthProvider, useAuth, storage } from './context/AuthContext'
import LoadingScreen from './screens/LoadingScreen'
import WelcomeScreen from './screens/WelcomeScreen'
import ENSSearchScreen from './screens/ENSSearchScreen'
import ENSDashboardScreen from './screens/ENSDashboardScreen'
import HomeTab from './tabs/HomeTab'
import SendTab from './tabs/SendTab'
import BiometricModal from './modals/BiometricModal'
import PermissionsTab from './tabs/PermissionsTab'
import ActivityTab from './tabs/ActivityTab'
import RequestModal from './modals/RequestModal'
import SwapModal from './modals/SwapModal'
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
  const { user, isAuthenticated, ensName } = useAuth()
  const [flow, setFlow] = useState<AppFlow>('loading')
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [showBio, setShowBio] = useState(false)
  const [bioData, setBioData] = useState<{
    actionType: 'transfer' | 'policy' | 'subname' | 'auth'
    amount?: string
    recipient?: string
    recipientAddress?: string
    policyDetails?: string
  }>({ actionType: 'transfer', amount: '$50.00', recipient: 'alex.hash.eth' })
  const [showRequest, setShowRequest] = useState(false)
  const [showSwap, setShowSwap] = useState(false)

  // Sync flow back to login if user logs out
  useEffect(() => {
    if (flow === 'app' && !isAuthenticated && !user) {
      setFlow('welcome')
    }
  }, [flow, isAuthenticated, user])

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.container, { backgroundColor: colors.bg }]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
      />

      {/* ── Loading Overlay (Auto-transitions to App if authenticated) ── */}
      {flow === 'loading' && (
        <LoadingScreen
          onDone={() => {
            const hasSession = !!user || !!storage.get('transakt_user_session')
            if (hasSession) {
              setFlow('app')
            } else {
              setFlow('welcome')
            }
          }}
        />
      )}

      {/* ── Onboarding Flows ── */}
      {flow === 'welcome' && (
        <WelcomeScreen
          onContinue={() => {
            const onboardingDone = storage.get('transakt_onboarding_completed') === 'true'
            const hasEns = ensName && ensName !== 'hash.eth'
            if (onboardingDone || hasEns) {
              setFlow('app')
            } else {
              setFlow('ens-search')
            }
          }}
        />
      )}

      {flow === 'ens-search' && (
        <ENSSearchScreen
          onPurchase={() => {
            storage.set('transakt_onboarding_completed', 'true')
            setFlow('app')
          }}
        />
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
                onReview={(data) => {
                  setBioData({
                    actionType: 'transfer',
                    amount: data.amount,
                    recipient: data.recipient,
                    recipientAddress: data.recipientAddress,
                  })
                  setShowBio(true)
                }}
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
              actionType={bioData.actionType}
              amount={bioData.amount}
              recipient={bioData.recipient}
              recipientAddress={bioData.recipientAddress}
              policyDetails={bioData.policyDetails}
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
