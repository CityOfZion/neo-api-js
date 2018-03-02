export { antChain } from './eco/services/antChain';
export { antChainXyz } from './eco/services/antChainXyz';
export { neoScan } from './eco/services/neoScan';
export { neon } from './eco/services/neon';
export { pyrest } from './eco/services/pyrest';
export { node } from './services/node/index.js';
export { rest } from './services/rest.js';
export { registry } from './registry.js';
export { service } from './services/service.js';

import { registerProtocolClient } from './registry.js';

import { axiosClient } from './protocols/axios.http.js';

registerProtocolClient(axiosClient);
