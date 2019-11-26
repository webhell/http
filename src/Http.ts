import axios, { AxiosStatic, AxiosInstance, AxiosRequestConfig } from 'axios';
import { ResError } from './ResClass';
import { ResCodeEnum } from './ResCodeEnum';

const defaultConfig: AxiosRequestConfig = {
  timeout: 60000
};
export class Http {
  Instance: AxiosInstance;
  constructor(options: AxiosRequestConfig) {
    this.Instance = axios.create({
      ...defaultConfig,
      ...options
    });
    this.interceptor(this.Instance);
  }
  private interceptor(instance: AxiosInstance) {
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
      config.headers = {
        ...config.headers,
        ...header
      }
      return config;
    }, error => {
      console.log('interceptors.request error');
      return Promise.reject(new ResError(ResCodeEnum.MIDDLEWARE_ERROR, error))
    });

    instance.interceptors.response.use(response => {
      console.log('interceptors.response success');
      const { data: res } = response;
      if (res.code === 200) {
        return res;
      }
      return Promise.reject(new ResError(res.code, res.message, res.data));
    }, error => {
      console.log('interceptors.response error');
      return Promise.reject(new ResError(ResCodeEnum.MIDDLEWARE_ERROR, error))
    })
  }
}







