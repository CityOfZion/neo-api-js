import { angularClient } from './angular.http.js';
import { axiosClient } from './axios.http.js';

export function protocols () {
    return {
        angularClient: angularClient,
        axiosClient: axiosClient
    };
}