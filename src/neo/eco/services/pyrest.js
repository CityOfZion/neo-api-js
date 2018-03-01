import { RestService } from '../../services/rest';
import { serviceOptions } from '../../services/serviceOptions';

export function pyrest(options) {
    var inst = new RestService();

    serviceOptions(inst, 'pyrest', options);

    inst.getCurrentBlockHeight = getCurrentBlockHeight;

    return inst;
}

function getCurrentBlockHeight () {
    return this.$get('status', null, { transformResponse: transformResponse });

    function transformResponse (response) {
        return {
            height: response.data && response.data.current_height,
            version: response.data && response.data.version
        };
    }
}
