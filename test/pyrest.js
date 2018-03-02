var expect  = require('chai').expect;
var neo = require('../');

var CHAIN_URL = 'https://pyrest1.redpulse.com/v1/';

describe('Rest Services', function() {

    this.timeout(5000);

    var neon = neo.pyrest(CHAIN_URL);

    describe('Block', function () {


        it('get current block height', function () {
            return neon.getCurrentBlockHeight().then(function (result) {
                console.log(JSON.stringify(result, null, 2));
                expect(result.height).to.be.a('number');
            });
        });

    });

});

