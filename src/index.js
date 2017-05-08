const bitcoinjslib = require('bitcoinjs-lib')
const initDebug = require('debug')

const debug = initDebug('bitgo-bitcoin-wallet')

class BitgoWallet {
  constructor(config) {
    this.config = config
    this.bitgo = config.bitgo
    this.walletId = config.walletId
    this.passphrase = config.passphrase
    this.chain = config.chain || 0
    this.minConfirms = config.minConfirms
    this._cache = {}
  }

  _cachedSession() {

  }

  _cachedWallet() {
    return Promise.resolve().then(() => {
      if (this._cache.wallet) return this._cache.wallet
      return this._loadWallet()
    })
  }

  _loadWallet() {
    debug('loading wallet...')
    return this.bitgo.wallets().get({
      id: this.walletId,
    }).then((wallet) => {
      debug('wallet loaded.')
      this._cache.wallet = wallet
      return wallet
    })
  }

  summary({ cached } = {}) {
    return Promise.resolve().then(() => {
      if (cached) {
        return this._cachedWallet()
      }
      return this._loadWallet()
    }).then((wallet) => wallet.wallet)
  }

  // TODO: add to abstract wallet
  transaction({ hash }) {
    return this._cachedWallet().then((wallet) => (
      wallet.getTransaction({ id: hash }).then((transaction) => {
        transaction.hash = transaction.id
        transaction.outputs.forEach((output) => {
          output.address = output.account
          delete output.account
        })
        return transaction
      })
    ))
  }

  send({ address, amount }) {
    return this._cachedWallet().then((wallet) => (
      wallet.sendCoins({
        address,
        amount,
        walletPassphrase: this.passphrase,
        // only choose unspent inputs with a certain number of confirmations
        minConfirms: this.minConfirms,
      })
    )).then((tx) => tx)
  }

  sendOpReturn(something) {
    const data = Buffer.isBuffer(something) ? something : new Buffer(something)
    const bitgo = this.bitgo

    let keychain
    let wallet

    // get keychain
    return this._cachedWallet().then((_wallet) => {
      wallet = _wallet
      return wallet.getEncryptedUserKeychain()
    })
    .then((_keychain) => {
      keychain = _keychain
      // decrypt the user key with the passphrase
      keychain.xprv = bitgo.decrypt({
        password: this.passphrase,
        input: keychain.encryptedXprv,
      })
      // build op return output
      const outputScript = bitcoinjslib.script.nullDataOutput(data)
      // Set recipients
      const recipients = [{
        script: outputScript,
        amount: 0, // TODO: include fee?
      }]

      return wallet.createTransaction({
        recipients,
        forceChangeAtEnd: true,
      })
    })
    .then((transaction) => (
      wallet.signTransaction({
        keychain,
        transactionHex: transaction.transactionHex,
        unspents: transaction.unspents,
      })
    ))
    .then((transaction) => (
      wallet.sendTransaction({
        tx: transaction.tx,
      })
    ))
  }

  address({ address }) {
    return this._cachedWallet().then((wallet) => (
      wallet.address({ address })
    ))
    .then((addressInfo) => (
      addressInfo
    ))
  }

  createAddress({ label } = {}) {
    let address
    let wallet
    return this._cachedWallet().then((_wallet) => {
      wallet = _wallet
      return wallet.createAddress({ chain: this.chain })
    })
    .then((_address) => {
      address = _address
    })
    .then(() => {
      if (!label) return null
      return wallet.setLabel({ label, address: address.address })
    })
    .then(() => address)
  }

}

export default (config) => new BitgoWallet(config)
