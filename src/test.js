import test from 'blue-tape'
import walletTests from 'abstract-bitcoin-wallet'
import bitgoWallet from './'
import { BitGo } from 'bitgo'

const bitgo = new BitGo({
  accessToken: process.env.BITGO_TOKEN,
  env: process.env.BITGO_ENV || 'test',
})

const wallet = bitgoWallet({
  bitgo,
  minConfirms: 0,
  walletId: process.env.BITGO_WALLET,
  passphrase: process.env.BITGO_PASSPHRASE,
  // makes test more deterministic by only
  // spending from outputs with >3 confirms
  // this was an issue with travis running up to 6
  // tests in parallel
  // minConfirms: 3,
})

walletTests(wallet)

// Test sendOpReturn (not in abstract-bitcoin-wallet yet)
test('sendOpReturn', (t) => (
  wallet.sendOpReturn('some data!').then((transaction) => {
    t.equal(transaction.status, 'accepted')
    t.equal(typeof transaction.tx, 'string')
  })
))
