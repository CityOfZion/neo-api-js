import axios from 'axios';
import { providerRegistrySet } from './registry.js';

export default function register () {
    providerRegistrySet(AxiosService());
}

function AxiosService () {

    var supportMap = { http: true, rpc: true };

    function supportsProtocol (protocol) {
        return supportMap[protocol];
    }

    function invoke (restOptions) {
        return axios(restOptions);
    }

    function serialize (obj) {
        return obj && Object.keys(obj).map(function (key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
        }).join('&');
    }

    function filterKeys (srcOptions, keys) {
        return keys.reduce(function (result, k) {
            if (srcOptions[k]) {
                result[k] = srcOptions[k];
            }

            return result;
        }, {});
    }

    function buildRequestOptions (options) {

        //Build Url with queryParams
        var paramStr = options.queryParams && serialize(options.queryParams);

        if(paramStr) {
            options.url = options.url + '?' + paramStr;
        }

        // Don't allow any undefined values into Fetch Options
        options = filterKeys(options, ['method', 'url', 'params', 'body', 'data', 'cache', 'headers']);

        options.headers = {};
        
        options.headers['Accept'] = 'application/json';
        options.headers['Content-Type'] = 'application/json';

        if (options.body) {
            options.body = JSON.stringify(options.body);
        }

        if (options.data) {
            options.data = JSON.stringify(options.data);
        }

        return options;
    }

    return {
        invoke: invoke,
        supportsProtocol: supportsProtocol,
        buildRequestOptions: buildRequestOptions
    };
}
