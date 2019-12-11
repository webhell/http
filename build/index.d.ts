import { ResCodeEnum } from "./ResCodeEnum";
import { ResJson, ResError } from "./ResClass";
import axios, { AxiosInstance } from 'axios';
import * as qs from 'querystring';
import { FetchStatus, FetchType, createModel, fetchPromise, IModel } from "./dataModel";
declare const http: AxiosInstance;
export { ResCodeEnum, ResJson, ResError, axios, qs, FetchStatus, FetchType, createModel, fetchPromise, IModel, };
export default http;
