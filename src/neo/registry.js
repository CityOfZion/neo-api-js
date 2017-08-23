let protocolClient;

export let registry = {
    registerProtocolClient: registerProtocolClient
};


export function registerProtocolClient (client) {
    protocolClient = client;
}

export function getProtocolClient () {
    return protocolClient;
}

