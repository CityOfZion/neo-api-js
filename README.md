# NEO JavaScript API

A JavaScript API for connecting to a NEO Network. Interface methods implement low-level protocols and provide access to NEO nodes and Antchain.org API Services.

Available soon on `npm` and `bower`.

[Documentation](https://github.com/CityOfZion/neo-api-js/wiki)

## Building

npm run build

Creates two different bundles: One as a node module `build/neo.node.js` and one for the Browser `build/neo.js`

## Installing
Each built bundle is a [UMD](https://github.com/umdjs/umd) module and supports AMD, CommonJS, and vanilla environments. Developers can create a custom bundle using [Rollup](https://rollupjs.org) or your preferred bundler. 

## Usage

NodeJS
```node
var neo = require('neo.node.js');
```

HTML:
```html
<script src="neo.js"></script>
```

Use the `neo` object in your JavaScript environment.

```js
var rpc = neo.rpc('http://localhost:10332');
rpc.getBlockCount().then(function (result) {
    console.log('Current block height: ' + result);
});
rpc.getLastBlockHash().then(function (result) {
    console.log('Hash of last block: ' + result);
});
```

```js
var options = {
    baseUrl: 'http://www.antchain.org/api/v1/',
    transform: neo.transforms.antchain
};
neo.rest(options).getAddressValue('AQVh2pG732YvtNaxEGkQUei3YA4cvo7d2i').then(function (addressValue) {
    console.log(addressValue.antShare.value);
    console.log(addressValue.antCoin.value);
});
```

More examples coming soon!
