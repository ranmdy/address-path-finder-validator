import { ethers } from "ethers";
import * as bip39 from "bip39";

const COUNT = 5;

const BASE_PATHS = [
  "m/44'/60'/0'/0",
  "m/44'/60'/0'",
  "m/44'/60'/1'/0"
];

function run(mnemonic) {
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error("Invalid mnemonic");
  }

  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const master = ethers.HDNodeWallet.fromSeed(seed);

  for (const base of BASE_PATHS) {
    console.log(`\nPATH: ${base}/i`);

    for (let i = 0; i < COUNT; i++) {
      const node = master.derivePath(`${base}/${i}`);
      console.log(`Index ${i}: ${node.address}`);
    }
  }
}

const seed = process.argv[2];
if (!seed) {
  console.log('Usage: node derive-paths-fixed.js "seed phrase"');
  process.exit(1);
}

run(seed);