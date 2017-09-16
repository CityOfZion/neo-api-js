
import { cluster } from 'cluster';

export function clusterClient () {

    let uid = 0;
    let pendingMessage = {};

    cluster.on('message', handleIncomingMessage);

    //uid to identify response
    function invoke (body) {

        ++uid;

        return new Promise(function (resolve, reject) {

            pendingMessage[uid] = responseHandler(resolve, reject, uid);

            cluster.send(body);

            //Every request needs to have a response in order to cleanup response handler
        });
    }

    function responseHandler (resolve, reject, uid) {
        return function (result) {
            if (result.success) {
                resolve(result);
            }
            else {
                reject(result);
            }

            pendingMessage[uid] = null;
        };
    }

    function handleIncomingMessage (body) {
        if (body.uid) {

            if(pendingMessage.hasOwnProperty(body.uid)) {
                //This is a result
                pendingMessage[uid](body);
            }
            else if (body.target === cluster.worker.id) {

            }
        }
    }

    function buildRequestOptions (options) {
        return {
            data: options.data
        };
    }

    return {
        invoke: invoke,
        buildRequestOptions: buildRequestOptions
    };
}

