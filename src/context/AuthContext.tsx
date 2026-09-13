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

export interface SubAccount {
  id: string
  name: string
  ens: string
  email?: string
  address?: string
  role: string
  eth: string
  fiat: string
  badge: 'ACTIVE' | 'LOCKED' | 'AUTO' | 'INVITED'
  hex: string
  badgeBg: string
  badgeBorder: string
  initials: string
  avatarHue: string
  weeklyLimit?: string
  autoDrop?: string
  canSend?: boolean
  canEditProfile?: boolean
  inviteLink?: string
}

interface AuthContextType {
  user: UserSession | null
  ensName: string
  subAccounts: SubAccount[]
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  pendingEmail: string | null
  loginWithPasskey: () => Promise<boolean>
  sendEmailMagicLink: (email: string) => Promise<boolean>
  verifyEmailOtp: (code: string) => Promise<boolean>
  connectExternalWallet: (type: 'metamask' | 'walletconnect') => Promise<boolean>
  setEnsName: (ensName: string) => void
  addSubAccount: (account: SubAccount) => void
  updateSubAccount: (id: string, updates: Partial<SubAccount>) => void
  deleteSubAccount: (id: string) => void
  logout: () => void
  privyAppId: string
}

const DEFAULT_PRIVY_APP_ID = process.env.EXPO_PUBLIC_PRIVY_APP_ID as string

export const storage = {
  get: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key)
      }
    } catch {}
    return null
  },
  set: (key: string, val: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, val)
      }
    } catch {}
  },
  remove: (key: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key)
      }
    } catch {}
  },
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  ensName: 'hash.eth',
  subAccounts: [],
  isAuthenticated: false,
  isLoading: false,
  error: null,
  pendingEmail: null,
  loginWithPasskey: async () => false,
  sendEmailMagicLink: async () => false,
  verifyEmailOtp: async () => false,
  connectExternalWallet: async () => false,
  setEnsName: () => {},
  addSubAccount: () => {},
  updateSubAccount: () => {},
  deleteSubAccount: () => {},
  logout: () => {},
  privyAppId: DEFAULT_PRIVY_APP_ID,
})

import { isValidEthereumAddress } from '../services/sepoliaRpc'

// Deterministic smart account address generator for realistic fallback
export function generateSmartAccountAddress(seed: string): string {
  let hash1 = 0
  let hash2 = 0
  for (let i = 0; i < seed.length; i++) {
    hash1 = (hash1 << 5) - hash1 + seed.charCodeAt(i)
    hash1 |= 0
    hash2 = (hash2 << 7) - hash2 + seed.charCodeAt(i)
    hash2 |= 0
  }
  const hex1 = Math.abs(hash1).toString(16).padStart(8, '0')
  const hex2 = Math.abs(hash2).toString(16).padStart(8, '0')
  const hex3 = (Math.abs(hash1 ^ hash2) + 0x12345678).toString(16).padStart(8, '0')
  const hex4 = (Math.abs(hash1 + hash2) + 0x87654321).toString(16).padStart(8, '0')
  const hex5 = (Math.abs(hash1 * 3) + 0xabcdef01).toString(16).padStart(8, '0')
  return `0x${(hex1 + hex2 + hex3 + hex4 + hex5).slice(0, 40)}`
}

const DEFAULT_STARTER_SUBACCOUNTS = (root: string): SubAccount[] => [
  {
    id: 'sub_pay_default',
    name: 'Daily Pocket',
    ens: `pay.${root}`,
    email: 'alex@transakt.app',
    address: '0x3F8a92e104dB2D9B387799147D3bEf32A606Ea38',
    role: 'Limit: $50/tx',
    eth: '0.12 ETH',
    fiat: '$342.80',
    badge: 'ACTIVE',
    hex: '#1DB563',
    badgeBg: 'rgba(29,181,99,0.12)',
    badgeBorder: 'rgba(29,181,99,0.28)',
    initials: 'PA',
    avatarHue: '150',
    weeklyLimit: '$250/week',
    autoDrop: 'Weekly',
    canSend: true,
    canEditProfile: true,
    inviteLink: `https://transakt.app/join?ens=pay.${root}&email=alex@transakt.app`,
  },
  {
    id: 'sub_vault_default',
    name: 'College Vault',
    ens: `vault.${root}`,
    email: 'vault@transakt.app',
    address: '0x71C8a27B2f90A2E80562eA9b294D0A38e83f3F9E',
    role: 'Parent Locked',
    eth: '1.20 ETH',
    fiat: '$3,428.00',
    badge: 'LOCKED',
    hex: '#FFB830',
    badgeBg: 'rgba(255,184,48,0.12)',
    badgeBorder: 'rgba(255,184,48,0.28)',
    initials: 'VA',
    avatarHue: '30',
    weeklyLimit: '$0/week',
    autoDrop: 'None',
    canSend: false,
    canEditProfile: false,
    inviteLink: `https://transakt.app/join?ens=vault.${root}&email=vault@transakt.app`,
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(() => {
    const cached = storage.get('transakt_user_session')
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (parsed && parsed.address) return parsed
      } catch {}
    }
    return null
  })

  // Synchronize active session to persistent storage
  useEffect(() => {
    if (user) {
      storage.set('transakt_user_session', JSON.stringify(user))
    } else {
      storage.remove('transakt_user_session')
    }
  }, [user])

  const [registeredEns, setRegisteredEns] = useState<string>(() => {
    return storage.get('transakt_ens_name') || 'hash.eth'
  })
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>(() => {
    const cached = storage.get('transakt_subaccounts')
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch {}
    }
    const initialRoot = storage.get('transakt_ens_name') || 'hash.eth'
    const starter = DEFAULT_STARTER_SUBACCOUNTS(initialRoot)
    storage.set('transakt_subaccounts', JSON.stringify(starter))
    return starter
  })
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
        ensName: registeredEns || 'hash.eth',
        authMethod: 'passkey',
        createdAt: new Date().toISOString(),
        isEmbeddedWallet: true,
      }

      storage.set('transakt_user_session', JSON.stringify(session))
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

      const data = await res.json().catch(() => ({}))
      const rawPrivyAddr = data?.user?.wallet?.address
      const smartAddress =
        rawPrivyAddr && isValidEthereumAddress(rawPrivyAddr)
          ? rawPrivyAddr
          : generateSmartAccountAddress(email)

      const userId = data?.user?.id || `privy_${Math.random().toString(36).substring(2, 9)}`
      const session: UserSession = {
        id: userId,
        email,
        address: smartAddress,
        ensName: `${email.split('@')[0]}.${registeredEns || 'hash.eth'}`,
        authMethod: 'email',
        createdAt: new Date().toISOString(),
        isEmbeddedWallet: true,
      }

      storage.set('transakt_user_session', JSON.stringify(session))
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
            throw new Error(`MetaMask error: ${ethErr?.message || 'Unknown error'}`)
          }
        } else if (type === 'walletconnect') {
          throw new Error('WalletConnect is currently disabled. Please use MetaMask.')
        }
      } else {
        // No injected provider (e.g. mobile or no extension)
        if (type === 'metamask') {
          throw new Error('MetaMask is not installed. Please use a Web3 browser or install the extension.')
        } else {
          throw new Error('WalletConnect requires a project ID setup. Please use MetaMask on Web for now.')
        }
      }

      if (!externalAddress) {
        throw new Error('Failed to retrieve external wallet address.')
      }

      const session: UserSession = {
        id: `usr_${type}_${Date.now()}`,
        address: externalAddress,
        ensName: `${type === 'metamask' ? 'alex' : 'parent'}.${registeredEns || 'hash.eth'}`,
        authMethod: type,
        createdAt: new Date().toISOString(),
        isEmbeddedWallet: false,
      }

      storage.set('transakt_user_session', JSON.stringify(session))
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
    const cleanEns = ensName.trim().toLowerCase()
    storage.set('transakt_ens_name', cleanEns)
    setRegisteredEns(cleanEns)
    setUser((prev) => {
      if (prev) return { ...prev, ensName: cleanEns }
      return {
        id: `usr_${Date.now()}`,
        address: '0x71C8a27B2f90A2E80562eA9b294D0A38e83f3F9E',
        ensName: cleanEns,
        authMethod: 'passkey',
        createdAt: new Date().toISOString(),
        isEmbeddedWallet: true,
      }
    })
    setSubAccounts((prev) => {
      const updated = prev.map((a) => {
        const parts = a.ens.split('.')
        if (parts.length > 2) {
          const childLabel = parts[0]
          return {
            ...a,
            ens: `${childLabel}.${cleanEns}`,
            inviteLink: a.inviteLink
              ? a.inviteLink.replace(/ens=[^&]+/, `ens=${childLabel}.${cleanEns}`)
              : undefined,
          }
        }
        return a
      })
      storage.set('transakt_subaccounts', JSON.stringify(updated))
      return updated
    })
  }

  const addSubAccount = (acc: SubAccount) => {
    setSubAccounts((prev) => {
      const filtered = prev.filter((a) => a.id !== acc.id && a.ens !== acc.ens)
      const updated = [...filtered, acc]
      storage.set('transakt_subaccounts', JSON.stringify(updated))
      return updated
    })
  }

  const updateSubAccount = (id: string, updates: Partial<SubAccount>) => {
    setSubAccounts((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
      storage.set('transakt_subaccounts', JSON.stringify(updated))
      return updated
    })
  }

  const deleteSubAccount = (id: string) => {
    setSubAccounts((prev) => {
      const updated = prev.filter((a) => a.id !== id)
      storage.set('transakt_subaccounts', JSON.stringify(updated))
      return updated
    })
  }

  const logout = () => {
    setUser(null)
    setPendingEmail(null)
    setError(null)
    storage.remove('transakt_user_session')
    storage.remove('transakt_onboarding_completed')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        ensName: user?.ensName || registeredEns,
        subAccounts,
        addSubAccount,
        updateSubAccount,
        deleteSubAccount,
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
