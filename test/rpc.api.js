var expect  = require('chai').expect;
var neo = require('../');

var MAINNET_URL = 'http://seed5.neo.org:10332';

var TEST_TX_ID = '3631f66024ca6f5b033d7e0809eb993443374830025af904fb51b0334f127cda';
var TEST_TX_OUT_ID = 'f4250dab094c38d8265acc15c366dc508d2e14bf5699e12d9df26577ed74d657';
var TEST_ASSET_ID = '602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7';//'025d82f7b00a9ff1cfe709abe3c4741a105d067178e645bc3ebad9bc79af47d4';
var TEST_BLOCK_HEIGHT = 110712;

describe('RPC Services', function() {

    //this.timeout(5000);

    var mainNet = neo.node(MAINNET_URL);

    describe('Address', function () {

        //Must have a Wallet open on the Node before making a request to get Wallet Balance or Send from.
        // Since this is requested directly on a Mainnet node it will be rejected with an access denied error.

        it('get balance', function (done) {
            mainNet.getBalance(TEST_ASSET_ID).then(function (result) {
                console.log(JSON.stringify(result, null, 2));
                done(new Error('Expected method to reject.'))
            })
            .catch(function (err) {
                expect(err.message).to.equal('Access denied.');
                done();
            });
        });
    });

    describe('Block', function () {

        it('get last block hash', function () {
            return mainNet.getLastBlockHash().then(function (result) {
                expect(result).to.be.a('string');
            });
        });

        it('get block by height', function () {
            return mainNet.getBlockByHeight(TEST_BLOCK_HEIGHT, 1).then(function (result) {
                expect(result).to.have.any.keys('hash', 'index', 'tx', 'confirmations');
            });
        });

        it('get block count', function () {
            return mainNet.getBlockCount().then(function (result) {
                console.log(JSON.stringify(result, null, 2));
                expect(result).to.be.a('number');
            });
        });

//        it('get block hash by height', function () {
//            return mainNet.getBlockHashByHeight(TEST_BLOCK_HEIGHT).then(function (result) {
//                expect(result).to.equal('84b23ed8450c95f6222655c3ca73ba4ae5b2f8ccb5a6c7fe3872d7386b65422a');
//            });
//        });

    });

    describe('Neo Node', function () {

        it('get connection count', function () {
            return mainNet.getConnectionCount().then(function (result) {
                console.log(JSON.stringify(result, null, 2));
                expect(result).to.be.a('number');
            });
        });

        it('get raw mempool', function () {
            return mainNet.getRawMemPool().then(function (result) {
                console.log(JSON.stringify(result, null, 2));
                expect(result).to.be.a('array');
            });
        });

    });

//    describe('Transaction', function () {
//
//        it('get transaction by id', function () {
//            return mainNet.getRawTransaction(TEST_TX_ID, 1).then(function (result) {
//                expect(result).to.have.any.keys('txid', 'blockhash', 'confirmations');
//            });
//        });
//
//        it('get tx out', function () {
//            return mainNet.getTxOut(TEST_TX_OUT_ID, 0).then(function (result) {
//                expect(result).to.have.any.keys('asset', 'value', 'address');
//            });
//        });
//
//    });

});

