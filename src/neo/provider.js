export default Provider;

import axiosProvider from './providers/axios.provider.js';

var currentProvider = axiosProvider;

export function Provider (provider) {

    if (!provider) {
        return currentProvider;
    }

    currentProvider = provider;

    return this;
}

