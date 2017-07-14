import { getProviderByProtocol, getTransformsByService } from '../registry.js';

export function serviceOptions(service, initObj) {

    if (typeof(initObj) === 'string') {
        initObj = { baseUrl: initObj};
    }
    else if (typeof(initObj) !== 'object') {
        initObj = {};
    }

    service.serviceBaseUrl = initObj.baseUrl || '';
    service.serviceProtocol = service.hasProtocolSupport(initObj.protocol) ? initObj.protocol : service.defaultProtocol;
    service.servicePollInterval = initObj.poll || -1;
    service.serviceUseTransforms = false;

    service.baseUrl = baseUrl;
    service.protocol = protocol;
    service.provider = provider;
    service.poll = poll;
    service.useTransforms = useTransforms;

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
            return this.serviceProvider || getProviderByProtocol(this.serviceProtocol);
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

    function useTransforms (val) {

        if (!val) {
            return this.serviceUseTransforms;
        }

        this.serviceUseTransforms = val;

        return this;
    }
}

export function prepareOptions(service, methodSignature, options) {
    options = options || {};

    options.baseUrl = service.baseUrl();
    options.protocol = service.protocol();
    options.poll = service.poll();
    options.provider = service.provider();
    options.transform = transformPassThrough;

    if (service.serviceUseTransforms && service.serviceName)  {

        var availableTransforms = getTransformsByService(service.serviceName);

        if (availableTransforms) {
            options.transform = getTransform(availableTransforms, methodSignature);
        }
    }

    return options;
}

function getTransform (availableTransforms, methodSignature) {
    return function (rawData) {

        var foundTransform;

        availableTransforms.some(function (entry) {
            if (methodSignature.indexOf(entry.sig) === 0) {
                foundTransform = entry.transform;

                return true;
            }
        });

        return foundTransform ? foundTransform(rawData) : rawData;
    };
}

function transformPassThrough (rawData) {
    return rawData;
}

//neo.node().baseUrl('').protocol('http').poll(2000).getBlockHeight();
//neo.node().baseUrl('http://localhost:3033').poll(2000).getBlockHeight();
//neo.node({ baseUrl: 'http://localhost:3033', poll: 2000 }).getBlockHeight();