import {
  createPublicClient,
  http,
  parseEther,
  createWalletClient,
  parseGwei,
  defineChain,
  getAddress,
  Address,
  signatureToCompactSignature,
} from "viem";
import { avalancheFuji, fantomTestnet } from "viem/chains";

export const viemChain = defineChain({
  //fantomSonicTestnet
  id: 64165,
  name: "Fantom Sonic Testnet",
  network: "fantom-sonic-testnet",
  nativeCurrency: {
    name: "Fantom",
    symbol: "FTM",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpcapi.sonic.fantom.network/"],
    },
    public: {
      http: ["https://rpcapi.sonic.fantom.network/"],
    },
  },
});

export const viemClient = createPublicClient({
  // sonicClient
  chain: viemChain,
  transport: http(),
});

export const config = {
  https: true,
  serverAddress: "api.pio.finance",
  serverPort: "2096",
  devMode: true,
  activeChainId: 64165,
  activeChainHex: "0xfaa5", // oxfa2,
  viemChain: viemChain,
  viemClient: viemClient,
  apiRefreshRate: 1000,
  frontendOwner: "0x734A5a550744F16CCe335f5735bf5eeE24412ba2",
};
