import "dotenv/config";
import { ethers } from "ethers";
import * as bip39 from "bip39";
import axios from "axios";

/* ============================
   CONFIG
============================ */

const RPC_URL = process.env.ETH_RPC;
const GAP_LIMIT = 20;          // stop after 20 empty addresses
const MAX_ADDRESSES = 200;     // ⬅️ HARD STOP AT ADDRESS 200
const PRICE_BATCH = 20;

if (!RPC_URL) {
  throw new Error("❌ Missing ETH_RPC in .env");
}

/* ============================
   ERC20 ABI
============================ */

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

/* ============================
   COINGECKO
============================ */

async function getEthPrice() {
  const res = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price",
    { params: { ids: "ethereum", vs_currencies: "usd" } }
  );
  return res.data.ethereum.usd;
}

async function getTokenPrices(addresses) {
  const prices = {};

  for (let i = 0; i < addresses.length; i += PRICE_BATCH) {
    const batch = addresses.slice(i, i + PRICE_BATCH);
    try {
      const res = await axios.get(
        "https://api.coingecko.com/api/v3/simple/token_price/ethereum",
        {
          params: {
            contract_addresses: batch.join(","),
            vs_currencies: "usd"
          }
        }
      );
      Object.assign(prices, res.data);
    } catch {
      console.warn("⚠️ CoinGecko batch skipped");
    }
  }

  return prices;
}

/* ============================
   MAIN
============================ */

async function validateSeed(mnemonic) {
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error("❌ Invalid seed phrase");
  }

  console.log("✅ Seed phrase valid");
  console.log("📍 Path: m/44'/60'/0'/0/i");
  console.log(`🛑 Stop at address ${MAX_ADDRESSES} OR ${GAP_LIMIT} empty\n`);

  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const master = ethers.HDNodeWallet.fromSeed(seed);
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  const ethUsd = await getEthPrice();

  let index = 0;
  let emptyStreak = 0;

  let walletTotalUsd = 0;
  let walletTotalEth = 0;

  const tokenTotals = new Map();

  /* ============================
     ADDRESS SCAN
  ============================ */

  while (index < MAX_ADDRESSES && emptyStreak < GAP_LIMIT) {
    const path = `m/44'/60'/0'/0/${index}`;
    const wallet = master.derivePath(path);

    console.log(`\n🔍 Address #${index}: ${wallet.address}`);

    let hasActivity = false;
    let addressUsd = 0;

    /* ---- ETH ---- */
    const ethWei = await provider.getBalance(wallet.address);
    const eth = Number(ethers.formatEther(ethWei));

    if (eth > 0) {
      const ethValue = eth * ethUsd;
      console.log(`   ETH: ${eth} ($${ethValue.toFixed(2)})`);
      walletTotalEth += eth;
      walletTotalUsd += ethValue;
      addressUsd += ethValue;
      hasActivity = true;
    }

    /* ---- TOKENS ---- */
    const tokenResponse = await provider.send(
      "alchemy_getTokenBalances",
      [wallet.address, "erc20"]
    );

    for (const t of tokenResponse.tokenBalances || []) {
      if (t.tokenBalance === "0x0") continue;

      const tokenAddr = t.contractAddress.toLowerCase();

      if (!tokenTotals.has(tokenAddr)) {
        tokenTotals.set(tokenAddr, 0n);
      }

      tokenTotals.set(
        tokenAddr,
        tokenTotals.get(tokenAddr) + BigInt(t.tokenBalance)
      );

      hasActivity = true;
    }

    /* ---- STOP LOGIC ---- */
    if (hasActivity) {
      emptyStreak = 0;
      console.log(`   ✅ Address USD total: $${addressUsd.toFixed(2)}`);
    } else {
      emptyStreak++;
      console.log(`   ❌ Empty (${emptyStreak}/${GAP_LIMIT})`);
    }

    index++;
  }

  /* ============================
     TOKEN PRICING
  ============================ */

  console.log("\n🧮 Pricing tokens...\n");

  const tokenAddresses = [...tokenTotals.keys()];
  const prices = await getTokenPrices(tokenAddresses);

  console.log("========= TOKENS (AGGREGATED) =========");

  for (const [addr, raw] of tokenTotals.entries()) {
    try {
      const contract = new ethers.Contract(addr, ERC20_ABI, provider);
      const symbol = await contract.symbol();
      const decimals = await contract.decimals();

      const balance = Number(
        ethers.formatUnits(raw, decimals)
      );

      const price = prices[addr]?.usd || 0;
      const usdValue = balance * price;

      walletTotalUsd += usdValue;

      console.log(
        `${symbol}: ${balance} ($${usdValue.toFixed(2)})`
      );
    } catch {
      console.log(`Unknown token: ${addr}`);
    }
  }

  console.log("======================================");
  console.log(`📦 Addresses scanned: ${index}`);
  console.log(`ETH total: ${walletTotalEth}`);
  console.log(`💰 TOTAL WALLET VALUE: $${walletTotalUsd.toFixed(2)}`);
  console.log("======================================");
}

/* ============================
   RUN
============================ */

const seed = process.argv[2];
if (!seed) {
  console.log('Usage: node validator.js "seed phrase here"');
  process.exit(1);
}

validateSeed(seed).catch(console.error);