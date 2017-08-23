var expect  = require('chai').expect;
var neo = require('../');

var ANT_CHAIN_URL = 'http://www.antchain.org/api/v1/';//'https://neoscan.herokuapp.com/api/main_net/v1/';//;
var WALLET_ADDRESS = 'AN3dqjMYDiby5YjAsQsfQPFYVidi7tnont';

var TEST_TX_ID = '3631f66024ca6f5b033d7e0809eb993443374830025af904fb51b0334f127cda';
var TEST_BLOCK_HASH = 'd42561e3d30e15be6400b6df2f328e02d2bf6354c41dce433bc57687c82144bf';
var TEST_BLOCK_HEIGHT = '0';

describe('Rest Services', function() {

    //this.timeout(5000);

    var httpService = neo.rest(ANT_CHAIN_URL);

    it('get highest block', function () {
        return httpService.$get('block/get_current_height').then(function (result) {
            console.log(JSON.stringify(result, null, 2));
            expect(result.height).to.be.a('number');
        });
    });


});

