var providers = [];

export function providerRegistrySet(provider) {
    providers.push(provider);
}

export function providerByProtocol(protocol) {
    for (var i = 0; i < providers.length; i++) {
        if (providers[i].supportsProtocol(protocol)) {
            return providers[i];
        }
    }
}


//neo.node().baseUrl('').protocol('http').poll(2000).getBlockHeight();
//neo.node().baseUrl('http://localhost:3033').poll(2000).getBlockHeight();
//neo.node({ baseUrl: 'http://localhost:3033', poll: 2000 }).getBlockHeight();

