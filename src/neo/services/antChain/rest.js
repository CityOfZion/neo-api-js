import { prepareOptions } from '../serviceOptions.js';

export function RestService () {

    this.$post = $post;
    this.$get = $get;
    this.$put = $put;
    this.$delete = $delete;

    function $post (url, data, options, queryParams) {
        return httpRequest(this, url, 'POST', data, options, queryParams);
    }

    function $get (url, queryParams, options) {
        return httpRequest(this, url, 'GET', null, options, queryParams);
    }

    function $put (url, data, options, queryParams) {
        return httpRequest(this, url, 'PUT', data, options, queryParams);
    }

    function $delete (url, queryParams, options) {
        return httpRequest(this, url, 'DELETE', null, options, queryParams);
    }

    function httpRequest (service, url, method, data, options, queryParams) {

        return wrapPromise(function (resolve, reject) {

            var serviceOptions = prepareOptions(service, method + '::' + url, options);

            if (serviceOptions.baseUrl !== undefined) {
                url = serviceOptions.baseUrl + url;
            }

            serviceOptions.url = url;
            serviceOptions.body = data;
            serviceOptions.method = method;
            serviceOptions.queryParams = queryParams;
            serviceOptions.successFunction = resolve;
            serviceOptions.errorFunction = reject;

            makeHttpRequest(serviceOptions);
        });
    }

    // PRIVATE FUNCTIONS

    function wrapPromise (callback) {
        return new Promise(function (resolve, reject) {
            callback(resolve, reject);
        });
    }

    function makeHttpRequest (serviceOptions) {

        if (!serviceOptions.method || !serviceOptions.url) {
            throw new Error('You must configure at least the http method and url');
        }

        var restProvider = serviceOptions.provider;

        var restOptions = restProvider.buildRequestOptions(serviceOptions);

        restProvider.invoke(restOptions)
            .then(function (response) {
                if (response.status) {
                    serviceOptions.successFunction(serviceOptions.transform(response.data), response);
                }
                else {
                    serviceOptions.successFunction(response);
                }
            })
            .catch(function (response) {
                if (response.status) {
                    serviceOptions.errorFunction(response.data, response);
                }
                else {
                    //console.log(response);
                    serviceOptions.errorFunction(response);
                }
            });
    }
}

