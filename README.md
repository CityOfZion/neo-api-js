# NEO JavaScript API

A JavaScript API for connecting to a NEO Network. Interface methods provide access to NEO nodes and Antchain.org API Services implementing JSON-RPC and REST respectfully.

Available soon on `npm` and `bower`.

[Documentation](https://github.com/CityOfZion/neo-api-js/wiki)

## Building

npm run build

Creates two bundles: One for node module `dist/neo-api.node.js` and one for the Browser `dist/neo.js`

## Installing
Each bundle is a [UMD](https://github.com/umdjs/umd) module and supports AMD, CommonJS, and vanilla environments. Developers can create a custom bundle using [Rollup](https://rollupjs.org) or any preferred bundler. 

## Usage

NodeJS
```node
var neo = require('neo-api.node.js');
```

HTML:
```html
<script src="neo.js"></script>
```

Use `neo` object in your JavaScript environment.

```js
var localNode = neo.node('http://localhost:10332');
localNode.getBlockCount().then(function (result) {
    console.log('Current block height: ' + result);
});
localNode.getLastBlockHash().then(function (result) {
    console.log('Hash of last block: ' + result);
});
```

```js
var options = {
    baseUrl: 'http://www.antchain.org/api/v1/',
    transform: neo.transforms.antchain
};
neo.antChain(options).getAddressValue('AQVh2pG732YvtNaxEGkQUei3YA4cvo7d2i').then(function (addressValue) {
    console.log(addressValue.antShare.value);
    console.log(addressValue.antCoin.value);
});
```

More examples coming soon!

### Test

Run all the Tests:
```bash
npm test
```

Run only the REST API tests: 
```bash
npm test test/rest.api.js
```

Run only the JSON-RPC API tests:
```bash
npm test test/rpc.api.js
```
```