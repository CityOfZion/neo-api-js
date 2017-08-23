import { RpcService } from '../rpc';
import { IpcService } from '../ipc';
import { RestService } from '../rest';
import { serviceOptions } from '../serviceOptions';

export let factory = ServiceFactory();

function ServiceFactory () {

    function createRcpService (options) {
        let inst = new RpcService();

        serviceOptions(inst, 'node', options);

        return inst;
    }

    function createIpcService (options) {
        let inst = new IpcService();

        serviceOptions(inst, 'node', options);

        return inst;
    }

    function createRestService (options) {
        let inst = new RestService();

        serviceOptions(inst, 'node', options);

        return inst;
    }

    return {
        createRcpService: createRcpService,
        createIpcService: createIpcService,
        createRestService: createRestService
    };
}