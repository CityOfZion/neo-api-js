var protocolClient;
var serviceMap = {};

export function registerProtocolClient (client) {
    protocolClient = client;
}

export function getProtocolClient () {
    return protocolClient;
}

export function registerTransforms (serviceName, transforms) {
    serviceMap[serviceName] =  transforms;
}

export function getTransformsByService (serviceName) {
    return serviceMap[serviceName];
}

