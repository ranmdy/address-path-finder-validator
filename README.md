# address-path-finder-validator

three Node.js scripts for working out what addresses a mnemonic controls and
whether any of them hold funds.

built for situations where you have a seed phrase and need to figure out where
the money actually is — especially when you're not sure which wallet app derived
the addresses or which path it used.

---

## scripts

**`validator.js`** — the main one. scans up to 200 addresses on the standard
`m/44'/60'/0'/0/i` path. for each address it checks ETH balance and ERC20 token
balances via Alchemy, prices everything through CoinGecko, and stops after 20
consecutive empty addresses. gives you a total USD value at the end.

requires an Alchemy RPC — set `ETH_RPC` in a `.env` file.

```bash
node validator.js "your twelve word seed phrase here"
```

**`derive-addresses.js`** — simpler. just derives and prints the first 20
addresses from a mnemonic using `m/44'/60'/0'/0/i`. no network calls, no
balances — useful for quickly confirming addresses before doing anything else.

```bash
node derive-addresses.js "your twelve word seed phrase here"
```

**`derive-all-paths.js`** — derives addresses across multiple common HD paths:

```
m/44'/60'/0'/0/i
m/44'/60'/0'/i
m/44'/60'/1'/0/i
```

useful when you don't know which path the original wallet used. some older apps
and hardware wallets used non-standard paths, so the right address might not
show up on the default one.

```bash
node derive-all-paths.js "your twelve word seed phrase here"
```

---

## setup

```bash
git clone https://github.com/ranmdy/address-path-finder-validator.git
cd address-path-finder-validator
npm install

# only needed for validator.js
cp .env.example .env
# add your Alchemy RPC URL as ETH_RPC
```

---

## security

you're passing a live seed phrase into this. run it on a machine you trust,
don't paste the phrase anywhere else while you're using it, and don't commit
your `.env` or any file with the mnemonic in it.
