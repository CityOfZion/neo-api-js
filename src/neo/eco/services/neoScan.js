import { RestService } from '../../services/rest';
import { serviceOptions } from '../../services/serviceOptions';

export function neoScan(options) {
    var inst = new RestService();

    serviceOptions(inst, 'neoScan', options);

    inst.getCurrentBlockHeight = getCurrentBlockHeight;

    return inst;
}

function getCurrentBlockHeight () {
    return this.$get('get_height');
}