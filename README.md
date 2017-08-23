<p align="center">
  <img 
    src="http://res.cloudinary.com/vidsy/image/upload/v1503160820/CoZ_Icon_DARKBLUE_200x178px_oq0gxm.png" 
    width="125px;">
</p>

<h1 align="center">neo-api-js</h1>

<p align="center">
  NEO JavaScript API for connecting to a <b>NEO</b> Network.
</p>


# NEO JavaScript API

Interface methods provide access to JSON-RPC <b>NEO</b> Nodes as well as Rest Services to AntChain and Neon.

Available soon on `npm` and `bower`.

[Documentation](https://github.com/CityOfZion/neo-api-js/wiki)

## Building

npm run build

Creates two bundles: One for node module `dist/neo.node.js` and one for the Browser `dist/neo.js`

## Installing
Each bundle is a [UMD](https://github.com/umdjs/umd) module and supports AMD, CommonJS, and vanilla environments. Developers can create a custom bundle using [Rollup](https://rollupjs.org) or any preferred bundler. 

## Usage

NodeJS
```node
var neo = require('neo.node.js');
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
