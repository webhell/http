"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ResCodeEnum_1 = require("./ResCodeEnum");
exports.ResCodeEnum = ResCodeEnum_1.ResCodeEnum;
const ResClass_1 = require("./ResClass");
exports.ResJson = ResClass_1.ResJson;
exports.ResError = ResClass_1.ResError;
const axios_1 = require("axios");
exports.axios = axios_1.default;
const qs = require("querystring");
const http = axios_1.default.create({
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
    return Promise.reject(new ResClass_1.ResError(ResCodeEnum_1.ResCodeEnum.MIDDLEWARE_ERROR, error));
});
http.interceptors.response.use(response => {
    if (response.status === 200) {
        return response.data;
    }
    else {
        return Promise.reject(new ResClass_1.ResError(response.status, response.statusText, response.data));
    }
}, error => {
    return Promise.reject(new ResClass_1.ResError(ResCodeEnum_1.ResCodeEnum.MIDDLEWARE_ERROR, error));
});
exports.default = http;
