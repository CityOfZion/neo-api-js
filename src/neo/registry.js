var providers = [];
var serviceMap = {};

export function registerProvider (provider) {
    providers.push(provider);
}

export function getProviderByProtocol (protocol) {
    for (var i = 0; i < providers.length; i++) {
        if (providers[i].hasProtocolSupport(protocol)) {
            return providers[i];
        }
    }
}

export function registerTransforms (serviceName, transforms) {
    serviceMap[serviceName] =  transforms;
}

export function getTransformsByService (serviceName) {
    return serviceMap[serviceName];
}

