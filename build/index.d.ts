import { ResCodeEnum } from "./ResCodeEnum";
import { ResJson, ResError } from "./ResClass";
import axios, { AxiosInstance } from 'axios';
import * as qs from 'querystring';
import { FetchStatus, FetchType, createModelSimple, createModelList, fetchPromiseSimple, fetchPromiseList } from "./dataModel";
declare const http: AxiosInstance;
export { ResCodeEnum, ResJson, ResError, axios, qs, FetchStatus, FetchType, createModelSimple, createModelList, fetchPromiseSimple, fetchPromiseList, };
export default http;
