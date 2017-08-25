import { makeServiceRequest } from './serviceRequester.js';

export function IpcService () {

    this.$send = $send;

    function $send (method, params) {
        return ipcRequest(this, method, params);
    }

    function ipcRequest (service, method, params) {

        if (!method) {
            throw new Error('You must configure the ipc method');
        }

        let data = {
            method: method,
            params: params || []
        };

        let options = {};

        options.data = data;

        return makeServiceRequest(service, options);
    }
}

