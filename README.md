# Address Path Finder & Validator

A Node.js utility for deriving and validating Ethereum-compatible (EVM) wallet addresses across multiple hierarchical deterministic (HD) derivation paths using a single mnemonic.

This tool is intended for recovery, auditing, and research scenarios where the derivation path used by a wallet is unknown or differs from common defaults.

---

## Table of Contents

- Overview
- Use Cases
- How It Works
- Project Structure
- Requirements
- Installation
- Dependency Installation
- Usage
- Supported Derivation Paths
- Configuration
- Output
- Security Considerations
- Limitations
- Project Status
- Contributing
- License
- Author

---

## Overview

Wallets derived from a mnemonic use hierarchical deterministic paths as defined by BIP-32 and BIP-44 standards.  
While most EVM wallets use `m/44'/60'/0'/0/i`, variations are common across different applications and historical implementations.

This project automates the process of scanning multiple derivation paths and address indexes in order to locate addresses that exhibit on-chain activity or balances.

---

## Use Cases

- Recovering funds when the original wallet application is unknown
- Auditing large mnemonic wallets
- Verifying derivation logic across wallet implementations
- Research and educational exploration of HD wallet behavior
- Internal tooling for blockchain investigations

---

## How It Works

1. Accepts a mnemonic as input  
2. Iterates through predefined derivation paths  
3. Derives addresses incrementally by index  
4. Validates addresses by checking for activity or balances  
5. Stops scanning after a configured number of consecutive empty addresses  
6. Outputs discovered addresses to standard output  

---

## Requirements

- Node.js version 18 or higher  
- npm or yarn package manager  

---

## Installation

Clone the repository:

git clone https://github.com/ranmdy/address-path-finder-validator.git

cd address-path-finder-validator

---

## Dependency Installation

Install all required dependencies:

npm install

---

## Usage

Run the validator by passing a mnemonic phrase as a command-line argument:
node validator.js “”

### Example

node validator.js “test test test test test test test test test test test test”

---

## Supported Derivation Paths

Common derivation paths evaluated include:
m/44’/60’/0’/0/i
m/44’/60’/0’/i
m/44’/60’/i’/0/0
Paths can be modified or extended directly in the source files.

---

## Configuration

Configuration parameters such as:

- maximum index depth  
- stop conditions  
- derivation paths  

are currently defined in code.

---

## Output

Results are written to standard output and include:

- derivation path used  
- address index  
- derived address  
- validation status  

Output format is intentionally minimal to allow easy piping or redirection.

---

## Security Considerations

This tool operates on sensitive mnemonic material.

- Do not run on shared or untrusted machines  
- Do not commit mnemonics to version control  
- Do not paste mnemonics into public logs or screenshots  
- Prefer offline or isolated execution environments  

The software is provided as-is, without any guarantees.

---

## Limitations

- EVM-compatible chains only  
- Token pricing and fiat valuation are out of scope  
- No persistent storage of results  
- Network reliability affects validation accuracy  

---

## Project Status

- Core derivation logic is stable  
- Validation heuristics continue to evolve  
- CLI flags and structured output planned  

---

## Contributing

1. Fork the repository  
2. Create a feature branch  
3. Commit changes with clear messages  
4. Open a pull request  

---

## License

MIT License

---

## Author

ranmdy
