export { antChain } from './services/antChain/index.js';
export { antChainXyz } from './services/antChainXyz/index.js';
export { neon } from './services/neon/index.js';
export { node } from './services/node/index.js';
export { rest } from './services/rest.js';
export { registry } from './registry.js';
export { service } from './services/service.js';

import { registerProtocolClient, registerTransforms } from './registry.js';

import { axiosClient } from './protocols/axios.http.js';

registerProtocolClient(axiosClient);

import antChainTransforms from './services/antChain/transforms';

registerTransforms('antChain', antChainTransforms);

import neonTransforms from './services/neon/transforms';

registerTransforms('neon', neonTransforms);
