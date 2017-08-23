import { serviceOptions } from './serviceOptions.js';
import { makeServiceRequest } from './serviceRequester.js';

export function rest (options) {
    let inst = new RestService();

    serviceOptions(inst, 'rest', options);

    return inst;
}

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

        if (!method || !url) {
            throw new Error('You must configure at least the http method and url');
        }

        options = options || {};

        if (service.baseUrl() !== undefined) {
            url = service.baseUrl() + url;
        }

        options.url = url;
        options.body = data;
        options.method = method;
        options.queryParams = queryParams;

        if (!options.hasOwnProperty('transformResponse')) {
            options.transformResponse = function (response) {
                return response.data;
            };
        }

        if (!options.hasOwnProperty('transformResponseError')) {
            options.transformResponseError = function (response) {
                return response.data;
            };
        }

        return makeServiceRequest(service, options);
    }
}

