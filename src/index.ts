import { ResCodeEnum } from "./ResCodeEnum";
import { ResJson, ResError } from "./ResClass";
import axios, { AxiosInstance } from 'axios';
import * as qs from 'querystring';
import { FetchStatus, FetchType, createModel,fetchPromise, IModel } from "./dataModel";

const http: AxiosInstance = axios.create({
    timeout: 60000,
    validateStatus: status => status === 200
});

http.interceptors.request.use(config => {
    const method = (config.method || '').toLowerCase() || 'get';
    const isSimple = ['post', 'put', 'patch'].indexOf(method) === -1;
    if (!isSimple) {
        config.data = qs.stringify(config.data);
    }
    return config;
}, error => {
    return Promise.reject(new ResError(ResCodeEnum.MIDDLEWARE_ERROR, error))
});

http.interceptors.response.use(response => {
    return response;
}, error => {
    return Promise.reject(new ResError(ResCodeEnum.MIDDLEWARE_ERROR, error))
});

export {
    ResCodeEnum,
    ResJson,
    ResError,
    axios,
    qs,
    FetchStatus,
    FetchType,
    createModel,
    fetchPromise,
    IModel,
}

export default http;