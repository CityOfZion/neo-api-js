import { getProtocolClient, getTransformsByService } from '../registry.js';

export function serviceOptions(service, serviceName, initObj) {

    if (typeof(initObj) === 'string') {
        initObj = { baseUrl: initObj};
    }
    else if (typeof(initObj) !== 'object') {
        initObj = {};
    }

    service.serviceName = serviceName;
    service.serviceBaseUrl = initObj.baseUrl || '';
    service.servicePollInterval = initObj.poll || -1;
    service.serviceUseTransforms = false;

    service.baseUrl = baseUrl;
    service.protocolClient = protocolClient;
    service.poll = poll;
    service.useTransforms = useTransforms;

    function baseUrl (val) {

        if (!val) {
            return this.serviceBaseUrl;
        }

        this.serviceBaseUrl = val;

        return this;
    }

    function protocolClient (val) {

        if (!val) {
            return this.serviceProtocolClient || getProtocolClient();
        }

        this.serviceProtocolClient = val;

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

    options.protocolClient = service.protocolClient();
    options.baseUrl = service.baseUrl();
    options.poll = service.poll();
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