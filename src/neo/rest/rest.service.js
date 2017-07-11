import provider from '../provider.js';

export function RestService (opts) {

    var BASE_URL = '';

    if (opts) {
        if (typeof(opts) === 'string') {
            BASE_URL = opts;
        }
        else if (opts.hasOwnProperty('baseUrl')) {
            BASE_URL = opts.baseUrl;
        }
    }

    this.$post = $post;
    this.$get = $get;
    this.$put = $put;
    this.$delete = $delete;

    function $post (url, data, options, queryParams) {
        return httpRequest(url, 'POST', data, options, queryParams);
    }

    function $get (url, queryParams, options) {
        return httpRequest(url, 'GET', null, options, queryParams);
    }

    function $put (url, data, options, queryParams) {
        return httpRequest(url, 'PUT', data, options, queryParams);
    }

    function $delete (url, queryParams, options) {
        return httpRequest(url, 'DELETE', null, options, queryParams);
    }

    function httpRequest (url, method, data, options, queryParams) {

        return wrapPromise(function (resolve, reject) {

            options = options || {};

            if (options && options.baseUrl !== undefined) {
                url = options.baseUrl + url;
            }
            else {
                url = BASE_URL + url;
            }

            options.url = url;
            options.body = data;
            options.method = method;
            options.queryParams = queryParams;
            options.successFunction = resolve;
            options.errorFunction = reject;

            makeHttpRequest(options);
        });
    }

    // PRIVATE FUNCTIONS

    function wrapPromise (callback) {
        return new Promise(function (resolve, reject) {
            callback(resolve, reject);
        });
    }

    function makeHttpRequest (options) {

        if (!options.method || !options.url) {
            throw new Error('You must configure at least the http method and url');
        }

        var restProvider = provider();

        var restOptions = restProvider.buildRequestOptions(options);

        restProvider.invoke(restOptions)
            .then(function (response) {
                if (response.status) {
                    options.successFunction(response.data, response.status, response.headers, response.config);
                }
                else {
                    options.successFunction(response);
                }
            })
            .catch(function (response) {
                if (response.status) {
                    options.errorFunction(response.data, response);
                }
                else {
                    //console.log(response);
                    options.errorFunction(response);
                }
            });
    }
}

