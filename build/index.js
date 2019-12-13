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
exports.qs = qs;
const dataModel_1 = require("./dataModel");
exports.FetchStatus = dataModel_1.FetchStatus;
exports.FetchType = dataModel_1.FetchType;
exports.createModel = dataModel_1.createModel;
exports.fetchPromise = dataModel_1.fetchPromise;
const http = axios_1.default.create({
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
    return Promise.reject(new ResClass_1.ResError(ResCodeEnum_1.ResCodeEnum.MIDDLEWARE_ERROR, error));
});
http.interceptors.response.use(response => {
    return response;
}, error => {
    return Promise.reject(new ResClass_1.ResError(ResCodeEnum_1.ResCodeEnum.MIDDLEWARE_ERROR, error));
});
exports.default = http;
