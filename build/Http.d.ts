import { AxiosInstance, AxiosRequestConfig } from 'axios';
export declare class Http {
    Instance: AxiosInstance;
    constructor(options: AxiosRequestConfig);
    private interceptor;
}
