import { createSmartAccountClient } from "permissionless"
import { toSimpleSmartAccount } from "permissionless/accounts"
import { createPimlicoClient } from "permissionless/clients/pimlico"
import { createPublicClient, http } from "viem"
import { sepolia } from "viem/chains"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"
import { ENTRYPOINT_ADDRESS_V06 } from "permissionless" // Let's check if this exists

async function test() {
  const publicClient = createPublicClient({ chain: sepolia, transport: http("https://rpc.ankr.com/eth_sepolia") })
  const signer = privateKeyToAccount(generatePrivateKey())
  
  const account = await toSimpleSmartAccount({
    client: publicClient,
    owner: signer,
    entryPoint: {
      address: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
      version: "0.6",
    }
  })
  
  console.log('Account address:', account.address)
}
test().catch(console.error)
