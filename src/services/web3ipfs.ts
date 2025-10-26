import { ethers } from 'ethers'

export async function connectWallet(): Promise<string> {
  if ((window as any).ethereum) {
    const provider = new ethers.BrowserProvider((window as any).ethereum)
    const accounts = await provider.send('eth_requestAccounts', [])
    return accounts[0]
  }
  return 'No wallet'
}

export async function uploadToIpfs(json: any, files: File[]) {
  // Placeholder: In production, use Helia/Web3.Storage/Pinata.
  // Here we fake an IPFS CID based on content hash.
  const encoder = new TextEncoder()
  const bytes = encoder.encode(JSON.stringify({ json, files: files.map((f) => ({ name: f.name, size: f.size })) }))
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  const cid = Array.from(new Uint8Array(digest)).slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('')
  return { cid: `bafy${cid}`, files: files.map((f) => ({ name: f.name, size: f.size })) }
}

export async function fakeSendToChain(ipfsCid: string) {
  // Simulate a blockchain transaction and return a fake hash
  const enc = new TextEncoder()
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(ipfsCid + Date.now()))
  const hash = '0x' + Array.from(new Uint8Array(digest)).slice(0, 16).map((b) => b.toString(16).padStart(2, '0')).join('')
  return { hash }
}

// Network helpers (EVM testnets)
const CHAIN_PARAMS: Record<string, { chainIdHex: string; chainName: string; rpcUrls: string[]; currency: { name: string; symbol: string; decimals: number } }> = {
  sepolia: {
    chainIdHex: '0xaa36a7',
    chainName: 'Sepolia',
    rpcUrls: ['https://rpc.sepolia.org'],
    currency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
  },
  polygonAmoy: {
    chainIdHex: '0x13882',
    chainName: 'Polygon Amoy',
    rpcUrls: ['https://rpc-amoy.polygon.technology/'],
    currency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  },
}

async function ensureChain(target: keyof typeof CHAIN_PARAMS) {
  const ethereum = (window as any).ethereum
  if (!ethereum) throw new Error('No wallet found')
  const params = CHAIN_PARAMS[target]
  try {
    await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: params.chainIdHex }] })
  } catch (err: any) {
    // If chain not added, try to add it
    if (err?.code === 4902) {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: params.chainIdHex,
          chainName: params.chainName,
          nativeCurrency: params.currency,
          rpcUrls: params.rpcUrls,
        }],
      })
    } else {
      throw err
    }
  }
}

export async function sendApprovalTransaction(opts: { network: 'sepolia' | 'polygonAmoy'; to?: string; valueEth?: string }) {
  const ethereum = (window as any).ethereum
  if (!ethereum) throw new Error('No wallet found')
  await ensureChain(opts.network)
  const provider = new ethers.BrowserProvider(ethereum)
  const signer = await provider.getSigner()
  const to = opts.to || await signer.getAddress()
  const value = ethers.parseEther(String(opts.valueEth ?? '0'))
  const tx = await signer.sendTransaction({ to, value })
  return tx
}
