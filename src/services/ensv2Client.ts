import { createPublicClient, http, formatEther, formatUnits } from 'viem'
import { normalize } from 'viem/ens'
import { sepolia } from 'viem/chains'
import { registerGaslessRootName, mintGaslessSubname } from './pimlicoPaymaster'

// ============================================================================
// ENSv2 Hackathon Sepolia Deployment Configuration
// ============================================================================

export const ENSV2_HACKATHON_CONFIG = {
  chainId: 11155111,
  universalResolverAddress: '0xd26f2040d083af1cd2962ba303f4bea0c4faf142' as const,
  appUrl: 'https://hackathon-deployment-manager-app-v4.ens-cf.workers.dev/',
  explorerUrl: 'https://hackathon-deployment-portal-app.ens-cf.workers.dev/',
  defaultRpcUrl: process.env.EXPO_PUBLIC_SEPOLIA_RPC_URL as string,
}

// Public Client instance targeting Hackathon ENSv2 Universal Resolver
export const ensClient = createPublicClient({
  chain: {
    ...sepolia,
    contracts: {
      ...sepolia.contracts,
      ensUniversalResolver: {
        address: ENSV2_HACKATHON_CONFIG.universalResolverAddress,
      },
    },
  },
  transport: http(ENSV2_HACKATHON_CONFIG.defaultRpcUrl),
})

// ============================================================================
// ENSv2 Helper APIs
// ============================================================================

/**
 * Resolves an ENSv2 name or subname to its destination Ethereum address.
 * e.g. "smithfam.eth" or "pay.smithfam.eth" -> "0x1aD9..."
 */
export async function resolveEnsAddress(ensName: string): Promise<string | null> {
  if (!ensName || !ensName.includes('.')) return null

  try {
    const normalized = normalize(ensName.trim())
    const address = await ensClient.getEnsAddress({
      name: normalized,
    })
    return address || null
  } catch (err) {
    console.warn(`[ENSv2] Failed to resolve address for ${ensName}:`, err)
    return null
  }
}

/**
 * Reverse resolves an Ethereum address to its Primary ENSv2 name.
 * e.g. "0x1aD9..." -> "smithfam.eth"
 */
export async function lookupAddressEns(address: `0x${string}` | string): Promise<string | null> {
  if (!address || !address.startsWith('0x')) return null

  try {
    const ensName = await ensClient.getEnsName({
      address: address as `0x${string}`,
    })
    return ensName || null
  } catch (err) {
    console.warn(`[ENSv2] Failed to lookup ENS name for ${address}:`, err)
    return null
  }
}

/**
 * Retrieves a custom text record from an ENSv2 node.
 * e.g. key: "avatar", "email", "description", "url"
 */
export async function getEnsTextRecord(
  ensName: string,
  key: string
): Promise<string | null> {
  if (!ensName || !key) return null

  try {
    const normalized = normalize(ensName.trim())
    const text = await ensClient.getEnsText({
      name: normalized,
      key,
    })
    return text || null
  } catch (err) {
    console.warn(`[ENSv2] Failed to fetch text record '${key}' for ${ensName}:`, err)
    return null
  }
}

/**
 * Checks availability and pricing for a root ENS or family subname.
 */
export interface EnsNameCheckResult {
  name: string
  available: boolean
  usdPrice: number | null
  ethPrice: number | null
  isSubname: boolean
}

export async function checkEnsAvailability(
  query: string
): Promise<EnsNameCheckResult[]> {
  const clean = query.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
  if (!clean) return []

  const ETH_USD = 3240
  const isSubname = clean.includes('.')

  // Standard root and family variations
  const variants = isSubname
    ? [clean]
    : [`${clean}.eth`, `${clean}fam.eth`, `${clean}pay.eth`]

  const results: EnsNameCheckResult[] = []

  for (const name of variants) {
    try {
      const resolved = await resolveEnsAddress(name)
      const available = !resolved

      const isSub = name.split('.').length > 2
      const label = name.split('.')[0]

      let ethPrice = null
      let usdPrice = null

      if (available && !isSub) {
        try {
          // Fetch actual price from ENSv2 Hackathon Registrar on Sepolia
          const priceRaw = (await ensClient.readContract({
            address: '0xa88553f454b77203b0d036a05c894d555eaaa2cc',
            abi: [
              {
                name: 'getRegisterPrice',
                type: 'function',
                stateMutability: 'view',
                inputs: [
                  { name: 'label', type: 'string' },
                  { name: 'duration', type: 'uint64' },
                  { name: 'paymentToken', type: 'address' },
                ],
                outputs: [{ name: 'amount', type: 'uint256' }],
              },
            ],
            functionName: 'getRegisterPrice',
            args: [label, 31536000n, '0x768f42455a2d082e23ceef7d51e5787c82d67a39'],
          })) as bigint

          usdPrice = parseFloat(formatUnits(priceRaw, 6))
          ethPrice = usdPrice / ETH_USD
        } catch {
          // Standard fallback pricing based on label length
          usdPrice = label.length === 3 ? 640 : label.length === 4 ? 160 : 8.0
          ethPrice = usdPrice / ETH_USD
        }
      } else if (available && isSub) {
        // Subnames are sponsored and gasless
        ethPrice = 0
        usdPrice = 0
      }

      results.push({
        name,
        available,
        usdPrice,
        ethPrice,
        isSubname: isSub,
      })
    } catch (err) {
      console.warn('Price fetch error:', err)
      results.push({
        name,
        available: true,
        usdPrice: 8.0,
        ethPrice: 8.0 / ETH_USD,
        isSubname: name.split('.').length > 2,
      })
    }
  }

  return results
}

// ============================================================================
// ENSv2 Onchain Registration Execution
// ============================================================================

export type RegistrationStage =
  | 'idle'
  | 'simulating'
  | 'broadcasting'
  | 'confirming'
  | 'confirmed'
  | 'error'

export interface RegistrationProgress {
  stage: RegistrationStage
  detail: string
  txHash?: string
  explorerUrl?: string
  sepoliaTxUrl?: string
}

export interface RegistrationResult {
  success: boolean
  ensName: string
  ownerAddress: string
  txHash: string
  explorerUrl: string
  appUrl: string
  sepoliaTxUrl?: string
}

export async function executeEnsRegistration(
  ensName: string,
  ownerAddress: string,
  onProgress?: (progress: RegistrationProgress) => void
): Promise<RegistrationResult> {
  const cleanName = ensName.trim().toLowerCase()
  const isSubname = cleanName.split('.').length > 2

  try {
    // ─── Subnames: Route through Pimlico for gasless minting ───
    if (isSubname) {
      const parts = cleanName.split('.')
      const childLabel = parts[0]
      const parentName = parts.slice(1).join('.')

      onProgress?.({
        stage: 'simulating',
        detail: `Requesting Pimlico gas sponsorship for ${cleanName}...`,
      })

      const result = await mintGaslessSubname(
        parentName,
        childLabel,
        ownerAddress,
        (stage, detail) => {
          const stageMap: Record<string, RegistrationStage> = {
            preparing: 'simulating',
            sponsoring: 'simulating',
            submitting: 'broadcasting',
            confirming: 'confirming',
            confirmed: 'confirmed',
          }
          onProgress?.({
            stage: stageMap[stage] || 'simulating',
            detail,
          })
        }
      )

      const explorerUrl = `${ENSV2_HACKATHON_CONFIG.explorerUrl}name/${cleanName}`
      const appUrl = `${ENSV2_HACKATHON_CONFIG.appUrl}name/${cleanName}`
      const sepoliaTxUrl = result.txHash ? `https://sepolia.etherscan.io/tx/${result.txHash}` : ''

      onProgress?.({
        stage: 'confirmed',
        detail: `🎉 ${cleanName} minted gaslessly! Gas sponsored by Pimlico.`,
        txHash: result.txHash,
        explorerUrl,
        sepoliaTxUrl,
      })

      return {
        success: true,
        ensName: cleanName,
        ownerAddress,
        txHash: result.txHash,
        explorerUrl,
        appUrl,
        sepoliaTxUrl,
      }
    }

    // ─── Root names: Standard registration flow ───
    onProgress?.({
      stage: 'simulating',
      detail: 'Verifying Gas Manager sponsorship policy & simulating UserOperation...',
    })

    const result = await registerGaslessRootName(
      cleanName,
      ownerAddress,
      (stage, detail) => {
        const stageMap: Record<string, RegistrationStage> = {
          preparing: 'simulating',
          sponsoring: 'simulating',
          submitting: 'broadcasting',
          confirming: 'confirming',
          confirmed: 'confirmed',
        }
        onProgress?.({
          stage: stageMap[stage] || 'simulating',
          detail,
        })
      }
    )

    const explorerUrl = `${ENSV2_HACKATHON_CONFIG.explorerUrl}name/${cleanName}`
    const appUrl = `${ENSV2_HACKATHON_CONFIG.appUrl}name/${cleanName}`
    const sepoliaTxUrl = result.txHash ? `https://sepolia.etherscan.io/tx/${result.txHash}` : ''

    onProgress?.({
      stage: 'confirmed',
      detail: `🎉 ${cleanName} is officially registered and owned!`,
      txHash: result.txHash,
      explorerUrl,
      sepoliaTxUrl,
    })

    return {
      success: true,
      ensName: cleanName,
      ownerAddress,
      txHash: result.txHash,
      explorerUrl,
      appUrl,
      sepoliaTxUrl,
    }
  } catch (err: any) {
    onProgress?.({
      stage: 'error',
      detail: err?.message || 'Transaction failed on Sepolia.',
    })
    throw err
  }
}


