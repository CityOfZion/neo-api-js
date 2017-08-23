var expect  = require('chai').expect;
var neo = require('../');

var CHAIN_URL = 'http://api.neonwallet.com/v1/';//http://www.antchain.org/api/v1/';
var WALLET_ADDRESS = 'AN3dqjMYDiby5YjAsQsfQPFYVidi7tnont';

var TEST_TX_ID = '3631f66024ca6f5b033d7e0809eb993443374830025af904fb51b0334f127cda';
var TEST_BLOCK_HASH = 'd42561e3d30e15be6400b6df2f328e02d2bf6354c41dce433bc57687c82144bf';
var TEST_BLOCK_HEIGHT = '0';

describe('Rest Services', function() {

    this.timeout(5000);

    var neon = neo.neon(CHAIN_URL);

    describe('Address', function () {

        it('get address value', function () {
            return neon.getAddressBalance(WALLET_ADDRESS).then(function (result) {
                console.log(JSON.stringify(result, null, 2));
                expect(result).to.have.nested.property('GAS.balance');
            });
        });

    });

    describe('Block', function () {


        it('get current block height', function () {
            return neon.getCurrentBlockHeight().then(function (result) {
                console.log(JSON.stringify(result, null, 2));
                expect(result.height).to.be.a('number');
            });
        });

    });

//    describe('Transaction', function () {
//
//        it('get transaction by tx id', function () {
//            return neon.getTransactionByTxid(TEST_TX_ID).then(function (result) {
//                expect(result).to.be.a('string');
//            });
//        });
//
//    });

});

