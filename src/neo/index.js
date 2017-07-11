export { rest } from './rest/index.js';
export { rpc } from './rpc/index.js';

//AXIOS workaround - process.env.NODE_ENV
if (typeof process === 'undefined' && !window.process) {
    window.process = {env: {}};
}