"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const ResClass_1 = require("./ResClass");
const ResCodeEnum_1 = require("./ResCodeEnum");
const defaultConfig = {
    timeout: 60000
};
class Http {
    constructor(options) {
        this.Instance = axios_1.default.create(Object.assign(Object.assign({}, defaultConfig), options));
        this.interceptor(this.Instance);
    }
    interceptor(instance) {
        instance.interceptors.request.use(config => {
            console.log('interceptors.request success');
            const method = (config.method || '').toLowerCase();
            const header = (config.method || '').toLowerCase() === 'get' ?
                {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json; charset=UTF-8'
                } : {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            };
            config.headers = Object.assign(Object.assign({}, config.headers), header);
            return config;
        }, error => {
            console.log('interceptors.request error');
            return Promise.reject(new ResClass_1.ResError(ResCodeEnum_1.ResCodeEnum.MIDDLEWARE_ERROR, error));
        });
        instance.interceptors.response.use(response => {
            console.log('interceptors.response success');
            const { data: res } = response;
            if (res.code === 200) {
                return res;
            }
            return Promise.reject(new ResClass_1.ResError(res.code, res.message, res.data));
        }, error => {
            console.log('interceptors.response error');
            return Promise.reject(new ResClass_1.ResError(ResCodeEnum_1.ResCodeEnum.MIDDLEWARE_ERROR, error));
        });
    }
}
exports.Http = Http;
