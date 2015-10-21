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
});

walletTests(wallet);
