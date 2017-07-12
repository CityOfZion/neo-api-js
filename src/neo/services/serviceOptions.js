import { providerByProtocol } from '../providers/registry.js';

export function serviceOptions(service, initObj) {

    if (typeof(initObj) === 'string') {
        initObj = { baseUrl: initObj};
    }
    else if (typeof(initObj) !== 'object') {
        initObj = {};
    }

    service.serviceBaseUrl = initObj.baseUrl || '';
    service.serviceProtocol = service.supportsProtocol(initObj.protocol) ? initObj.protocol : service.defaultProtocol;
    service.servicePollInterval = initObj.poll || -1;

    service.baseUrl = baseUrl;
    service.protocol = protocol;
    service.provider = provider;
    service.poll = poll;

    function baseUrl (val) {

        if (!val) {
            return this.serviceBaseUrl;
        }

        this.serviceBaseUrl = val;

        return this;
    }

    function protocol (val) {

        if (!val) {
            return this.serviceProtocol;
        }

        this.serviceProtocol = val;

        return this;
    }

    function provider (val) {

        if (!val) {
            return this.serviceProvider || providerByProtocol(this.serviceProtocol);
        }

        this.serviceProvider = val;

        return this;
    }

    function poll (val) {

        if (!val) {
            return this.servicePollInterval;
        }

        this.servicePollInterval = val;

        return this;
    }
}

export function prepareOptions(service, options) {
    options = options || {};

    options.baseUrl = service.baseUrl();
    options.protocol = service.protocol();
    options.poll = service.poll();
    options.provider = service.provider();

    return options;
}

//neo.node().baseUrl('').protocol('http').poll(2000).getBlockHeight();
//neo.node().baseUrl('http://localhost:3033').poll(2000).getBlockHeight();
//neo.node({ baseUrl: 'http://localhost:3033', poll: 2000 }).getBlockHeight();