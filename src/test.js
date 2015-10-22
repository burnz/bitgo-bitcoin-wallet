import walletTests from 'abstract-bitcoin-wallet';
import bitgoWallet from './';
import dotenv from 'dotenv';
import { BitGo } from 'bitgo';

dotenv.load();

const bitgo = new BitGo({
  accessToken: process.env.BITGO_TOKEN,
  env: process.env.BITGO_ENV || 'test',
});

const wallet = bitgoWallet({
  bitgo,
  walletId: process.env.BITGO_WALLET,
  passphrase: process.env.BITGO_PASSPHRASE,
  // makes test more deterministic by only
  // spending from outputs with >3 confirms
  // this was an issue with travis running up to 6
  // tests in parallel
  // minConfirms: 3,
});

walletTests(wallet);
