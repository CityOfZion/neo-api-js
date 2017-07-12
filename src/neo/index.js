export { antChain } from './services/antChain/index.js';
export { node } from './services/node/index.js';

import registerAxios from './providers/axios.provider.js';

registerAxios();

//AXIOS workaround - process.env.NODE_ENV
if (typeof process === 'undefined' && !window.process) {
    window.process = {env: {}};
}