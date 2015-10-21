class BitgoWallet {
  constructor(config) {
    this.config = config;
    this.bitgo = config.bitgo;
    this.walletId = config.walletId;
    this.passphrase = config.passphrase;
    this.chain = config.chain || 0;
    this.minConfirms = config.minConfirms;
    this._cache = {};
  }

  _cachedSession() {

  }

  _cachedWallet() {
    return Promise.resolve()
    .then(() => {
      if (this._cache.wallet) return this._cache.wallet;
      return this._loadWallet();
    });
  }

  _loadWallet() {
    return this.bitgo
    .wallets()
    .get({ id: this.walletId })
    .then((wallet) => {
      this._cache.wallet = wallet;
      return wallet;
    });
  }

  summary({ cached } = {}) {
    return Promise.resolve()
    .then(() => {
      if (cached) {
        return this._cachedWallet();
      }
      return this._loadWallet();
    })
    .then((wallet) => {
      return wallet.wallet;
    });
  }

  // TODO: add to abstract wallet
  transaction({ hash }) {
    return this._cachedWallet()
    .then((wallet) => {
      return wallet.getTransaction({ id: hash })
      .then((transaction) => {
        transaction.hash = transaction.id;
        return transaction;
      });
    });
  }

  send({ address, amount }) {
    return this._cachedWallet()
    .then((wallet) => {
      return wallet.sendCoins({
        address,
        amount,
        walletPassphrase: this.passphrase,
        // only choose unspent inputs with a certain number of confirmations
        minConfirms: this.minConfirms,
      });
    })
    .then((tx) => {
      return tx;
    });
  }

  address({ address }) {
    return this._cachedWallet()
    .then((wallet) => {
      return wallet.address({ address });
    })
    .then((addressInfo) => {
      return addressInfo;
    });
  }

  createAddress({ label } = {}) {
    let address;
    let wallet;
    return this._cachedWallet()
    .then((_wallet) => {
      wallet = _wallet;
      return wallet.createAddress({ chain: this.chain });
    })
    .then((_address) => {
      address = _address;
    })
    .then(() => {
      if (!label) return null;
      return wallet.setLabel({ label, address: address.address });
    })
    .then(() => {
      return address;
    });
  }

}

export default (config) => {
  return new BitgoWallet(config);
};
