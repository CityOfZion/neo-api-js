var expect  = require('chai').expect;
var neo = require('../');

var ANT_CHAIN_URL = 'https://neoscan.herokuapp.com/api/main_net/v1';//http://www.antchain.org/api/v1/';
var WALLET_ADDRESS = 'AN3dqjMYDiby5YjAsQsfQPFYVidi7tnont';

var TEST_TX_ID = '3631f66024ca6f5b033d7e0809eb993443374830025af904fb51b0334f127cda';
var TEST_BLOCK_HASH = 'd42561e3d30e15be6400b6df2f328e02d2bf6354c41dce433bc57687c82144bf';
var TEST_BLOCK_HEIGHT = '0';

describe('Rest Services', function() {

    this.timeout(5000);

    var antChain = neo.antChain(ANT_CHAIN_URL);

    describe('Address', function () {

        it('get address value', function () {
            return antChain.getAddressBalance(WALLET_ADDRESS).then(function (result) {
                console.log(JSON.stringify(result, null, 2));
                expect(result).to.have.nested.property('asset[0].value');
            });
        });

        it('get unspent coins', function () {
            return antChain.getUnspentCoinsByAddress(WALLET_ADDRESS).then(function (result) {
                console.log(JSON.stringify(result, null, 2));
                expect(result).to.have.nested.property('[0].balance');
            });
        });
    });

    describe('Block', function () {

        it('get block by hash', function () {
            return antChain.getBlockByHash(TEST_BLOCK_HASH).then(function (result) {
                expect(result).to.be.a('string');
            });
        });

        it('get block by height', function () {
            return antChain.getBlockByHeight(TEST_BLOCK_HEIGHT).then(function (result) {
                expect(result).to.be.a('string');
            });
        });

        it('get current block', function () {
            return antChain.getCurrentBlock().then(function (result) {
                expect(result).to.be.a('string');
            });
        });

        it('get current block height', function () {
            return antChain.getCurrentBlockHeight().then(function (result) {
                console.log(JSON.stringify(result, null, 2));
                expect(result.height).to.be.a('number');
            });
        });

    });

    describe('Transaction', function () {

        it('get transaction by tx id', function () {
            return antChain.getTransactionByTxid(TEST_TX_ID).then(function (result) {
                expect(result).to.be.a('string');
            });
        });

    });

});

