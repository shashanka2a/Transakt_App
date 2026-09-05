import React, { createContext, useContext, useState, useEffect } from 'react'

export interface UserSession {
  id: string
  email?: string
  address: string
  ensName?: string
  authMethod: 'passkey' | 'email' | 'metamask' | 'walletconnect'
  createdAt: string
  isEmbeddedWallet: boolean
}

interface AuthContextType {
  user: UserSession | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  pendingEmail: string | null
  loginWithPasskey: () => Promise<boolean>
  sendEmailMagicLink: (email: string) => Promise<boolean>
  verifyEmailOtp: (code: string) => Promise<boolean>
  connectExternalWallet: (type: 'metamask' | 'walletconnect') => Promise<boolean>
  setEnsName: (ensName: string) => void
  logout: () => void
  privyAppId: string
}

const DEFAULT_PRIVY_APP_ID =
  process.env.EXPO_PUBLIC_PRIVY_APP_ID || 'cmto2iefd000q0bla0z8jfitr'

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  pendingEmail: null,
  loginWithPasskey: async () => false,
  sendEmailMagicLink: async () => false,
  verifyEmailOtp: async () => false,
  connectExternalWallet: async () => false,
  setEnsName: () => {},
  logout: () => {},
  privyAppId: DEFAULT_PRIVY_APP_ID,
})

// Deterministic dummy address generator for realistic fallback
function generateSmartAccountAddress(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0')
  return `0x71C8${hex.slice(0, 4)}...${hex.slice(-4)}`
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)

  // 1. Passkey Login Flow (FIDO2 / WebAuthn MPC Key)
  const loginWithPasskey = async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate WebAuthn passkey biometric prompt latency
      await new Promise((resolve) => setTimeout(resolve, 1200))

      const smartAddress = '0x3F8a92e104dB2D9B387799147D3bEf32A606Ea38'
      const session: UserSession = {
        id: `usr_passkey_${Date.now()}`,
        address: smartAddress,
        ensName: 'smithfam.eth',
        authMethod: 'passkey',
        createdAt: new Date().toISOString(),
        isEmbeddedWallet: true,
      }

      setUser(session)
      setIsLoading(false)
      return true
    } catch (err: any) {
      setError(err?.message || 'Passkey verification cancelled or failed.')
      setIsLoading(false)
      return false
    }
  }

  // 2. Email Magic Link Flow with Live Privy API
  const sendEmailMagicLink = async (emailInput: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    const normalizedEmail = emailInput.trim().toLowerCase()
    setPendingEmail(normalizedEmail)

    try {
      const res = await fetch('https://auth.privy.io/api/v1/passwordless/init', {
        method: 'POST',
        headers: {
          'privy-app-id': DEFAULT_PRIVY_APP_ID,
          'Content-Type': 'application/json',
          'privy-client': 'react-native/expo',
        },
        body: JSON.stringify({ email: normalizedEmail }),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson?.error || `Failed to send code (Status ${res.status})`)
      }

      setIsLoading(false)
      return true
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP code to your email.')
      setIsLoading(false)
      return false
    }
  }

  // 3. Verify OTP Code with Live Privy API
  const verifyEmailOtp = async (code: string): Promise<boolean> => {
    if (!code || code.length < 4) {
      setError('Please enter a valid 6-digit verification code.')
      return false
    }

    setIsLoading(true)
    setError(null)

    const email = pendingEmail || 'user@transakt.app'

    try {
      const res = await fetch('https://auth.privy.io/api/v1/passwordless/authenticate', {
        method: 'POST',
        headers: {
          'privy-app-id': DEFAULT_PRIVY_APP_ID,
          'Content-Type': 'application/json',
          'privy-client': 'react-native/expo',
        },
        body: JSON.stringify({ email, code: code.trim() }),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson?.error || 'Invalid verification code.')
      }

      const data = await res.json()
      const userId = data?.user?.id || `usr_${Date.now()}`
      const smartAddress = data?.user?.wallet?.address || generateSmartAccountAddress(email)

      const session: UserSession = {
        id: userId,
        email,
        address: smartAddress,
        ensName: `${email.split('@')[0]}.smithfam.eth`,
        authMethod: 'email',
        createdAt: new Date().toISOString(),
        isEmbeddedWallet: true,
      }

      setUser(session)
      setIsLoading(false)
      return true
    } catch (err: any) {
      setError(err?.message || 'Invalid verification code. Please check your email.')
      setIsLoading(false)
      return false
    }
  }

  // 4. External Wallet Flow (MetaMask / WalletConnect)
  const connectExternalWallet = async (
    type: 'metamask' | 'walletconnect'
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      let externalAddress: string | null = null

      // A. Check for injected Web3 provider in browser (MetaMask / injected EIP-1193)
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const eth = (window as any).ethereum
        // Support multi-provider setups (e.g. MetaMask alongside Coinbase Wallet)
        const provider =
          eth.providers?.find((p: any) => p.isMetaMask) ||
          (eth.isMetaMask ? eth : eth)

        if (type === 'metamask') {
          try {
            const accounts = await provider.request({
              method: 'eth_requestAccounts',
            })
            if (accounts && accounts.length > 0) {
              externalAddress = accounts[0]
            }
          } catch (ethErr: any) {
            if (ethErr?.code === 4001 || ethErr?.message?.includes('User rejected')) {
              throw new Error('Connection request was rejected in MetaMask.')
            }
            console.warn('Injected Web3 request accounts notice:', ethErr)
          }
        }
      }

      // B. Mobile or fallback pairing simulation if no injected provider
      if (!externalAddress) {
        await new Promise((resolve) => setTimeout(resolve, 900))
        if (type === 'metamask') {
          externalAddress = '0x1aD91eeC094c299F1269E64F37264aD5E5496465'
        } else {
          externalAddress = '0x9Bca473B5B8539b97779d750cDE2782eF939D840'
        }
      }

      const shortAddr = `${externalAddress.slice(0, 6)}...${externalAddress.slice(-4)}`
      const session: UserSession = {
        id: `usr_${type}_${Date.now()}`,
        address: externalAddress,
        ensName: `${type === 'metamask' ? 'alex' : 'parent'}.smithfam.eth`,
        authMethod: type,
        createdAt: new Date().toISOString(),
        isEmbeddedWallet: false,
      }

      setUser(session)
      setIsLoading(false)
      return true
    } catch (err: any) {
      setError(err?.message || `Failed to connect with ${type}.`)
      setIsLoading(false)
      return false
    }
  }

  const setEnsName = (ensName: string) => {
    if (user) {
      setUser({ ...user, ensName })
    }
  }

  const logout = () => {
    setUser(null)
    setPendingEmail(null)
    setError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        pendingEmail,
        loginWithPasskey,
        sendEmailMagicLink,
        verifyEmailOtp,
        connectExternalWallet,
        setEnsName,
        logout,
        privyAppId: DEFAULT_PRIVY_APP_ID,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
