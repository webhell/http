import { ResCodeEnum } from "./ResCodeEnum";
import { ResJson, ResError } from "./ResClass";
import axios, { AxiosInstance } from 'axios';
import * as qs from 'querystring';

const http: AxiosInstance = axios.create({
    timeout: 6000
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
    if (response.status === 200) {
        return response.data;
    } else {
        return Promise.reject(new ResError(response.status, response.statusText, response.data));
    }
}, error => {
    return Promise.reject(new ResError(ResCodeEnum.MIDDLEWARE_ERROR, error))
});

export {
    ResCodeEnum,
    ResJson,
    ResError,
    axios,
}

export default http;