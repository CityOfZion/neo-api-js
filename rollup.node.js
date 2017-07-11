var fs = require('fs');
var rollup = require('rollup');
var dependencies = require('./package.json').dependencies;

rollup.rollup({
  entry: './src/neo/index.js',
  external: Object.keys(dependencies)
}).then(function(bundle) {
  var code = bundle.generate({format: 'cjs'}).code;
  return new Promise(function(resolve, reject) {
    fs.writeFile('dist/neo.node.js', code, 'utf8', function(error) {
      if (error) return reject(error);
      else resolve();
    });
  });
}).catch(abort);

function abort(error) {
  console.error(error.stack);
}
