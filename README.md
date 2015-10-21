# bitgo-bitcoin-wallet

[![Build Status](https://travis-ci.org/olalonde/bitgo-bitcoin-wallet.svg)](https://travis-ci.org/olalonde/bitgo-bitcoin-wallet)

Implementation of [abstract-bitcoin-wallet](https://github.com/olalonde/abstract-bitcoin-wallet) for [BitGo](https://www.bitgo.com/api/?javascript).

## Install

```bash
npm install --save bitgo-bitcoin-wallet bitgo
```

## Usage

```javascript
import bitgoWallet from './';
import { BitGo } from 'bitgo';

const bitgo = new BitGo({
  accessToken: 'your bitgo access token',
  env: 'test',
});

const wallet = bitgoWallet({
  bitgo,
  walletId: 'your bitgo wallet id',
  passphrase: 'your bitgo passphrase',
});

wallet.createAddress().then((addrInfo) => {
  console.log(addrInfo);
});

// See abstract-bitcoin-wallet for docs
```


## Test

Create a `.env` file in the project root with the following values:

```env
BITGO_ENV=test
BITGO_TOKEN="your bitgo token"
BITGO_WALLET="your bitgo wallet id"
BITGO_PASSPHRASE="your bitgo passphrase"
```

```bash
npm test
```
