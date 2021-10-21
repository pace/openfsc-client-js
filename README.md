# FSC SDK

## Description
A JavaScript library which implements the [FSC-API](https://www.notion.so/pacetelematics/PACE-Fueling-Site-Connect-API-dc609d941f5c410fadf567892158c8b0) and communicates with the FSC
server through a web socket connection.

## Installation
### As NPM package
```bash
yarn add @pace/fsc-sdk
```

## Build
```bash
yarn build
```

## Type-checking the repo

```sh
yarn type-check
```

Run in `--watch` mode:

```sh
yarn type-check:watch
```

## Usage

```js
// index.js
import FSC from '@pace/fsc-sdk';

const session = new FSC({

  onPrices: function (session) {
    session.price(1, '0100', "LTR", "EUR", 1.339, 'Super Plus');
    session.price(1, '0200', "LTR", "EUR", 1.229, 'Super 95');
    session.price(1, '0300', "LTR", "EUR", 1.499, 'Super 95 e5');
  },

  onProducts: function (session) {
    session.product(1, '0100', 'ron98e5', 19.0);
    session.product(1, '0200', 'ron95e10', 19.0);
    session.product(1, '0300', 'ron95e5', 19.0);
  },

  onPumps: function (session) {
    session.pump(1, 'in-use');
    session.pump(2, 'out-of-order');
    session.pump(3, 'free');
    session.pump(4, 'ready-to-pay');
  },

  onPumpStatus: function (session, pumpNr, updateTTL) {
    if (updateTTL && updateTTL !== 0) {
      session.pump(pumpNr, 'free');
      setTimeout(function () {
        session.pump(pumpNr, 'in-use');
      }, updateTTL * 1000);
      setTimeout(function () {
        session.pump(pumpNr, 'ready-to-pay');
      }, updateTTL * 1000 * 2);
    } else {
      session.pump(pumpNr, 'free');
    }
  },

  onTransactions: function (session) {
    console.log('onTransactions ', session);

    session.transaction(3, 'c71b9838ad3dfc15', 'open', '0100', 'EUR',
      86.83, 72.978, 19.0, 13.65, 'LTR', 54.40, 1.339);
  },

  onClear: function (session, pumpNr, siteTransactionId, paceTransactionId) {
    console.log(pumpNr, siteTransactionId, paceTransactionId);
  }
});

const site1 = session.connect({
  siteID: '9eb56d5e-6563-430a-9d39-5ddf567e73d5',
  secret: '1d3b755d3bce8f09b4f8ff08dabf1796'
});

```


## License
MIT
