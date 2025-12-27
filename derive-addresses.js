import { ethers } from "ethers";
import * as bip39 from "bip39";

/* ============================
   CONFIG
============================ */

const DERIVE_COUNT = 20; // how many addresses to show

/* ============================
   MAIN
============================ */

function deriveAddresses(mnemonic) {
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error("❌ Invalid seed phrase");
  }

  console.log("✅ Seed phrase valid\n");

  // IMPORTANT:
  // ethers v6 fromPhrase() already derives:
  // m/44'/60'/0'/0/0
  const root = ethers.HDNodeWallet.fromPhrase(mnemonic);

  console.log("Derivation path base:");
  console.log("m/44'/60'/0'/0/i\n");

  for (let i = 0; i < DERIVE_COUNT; i++) {
    // RELATIVE derivation (ethers v6 rule)
    const wallet = root.derivePath(`0/${i}`);
    console.log(`Index ${i}: ${wallet.address}`);
  }
}

/* ============================
   RUN
============================ */

const seed = process.argv[2];

if (!seed) {
  console.log('Usage: node derive-addresses.js "seed phrase here"');
  process.exit(1);
}

deriveAddresses(seed);