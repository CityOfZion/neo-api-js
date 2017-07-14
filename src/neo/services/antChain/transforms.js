import AddressBalanceFactory from './models/address-balance.factory.js';
import AddressAssetFactory from './models/address-assets.factory.js';

export default AntChainTransforms();

function AntChainTransforms () {

    function transformGetValue (result) {
        return AddressBalanceFactory.createFromJson(result);
    }

    function transformGetUnspent (result) {
        return AddressAssetFactory.createFromJson(result);
    }

    return [
        { sig: 'GET::address/get_value/', transform: transformGetValue },
        { sig: 'GET::address/get_unspent/', transform: transformGetUnspent }
    ];

}