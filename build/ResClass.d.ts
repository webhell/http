import { ResCodeEnum } from './ResCodeEnum';
export declare class ResJson {
    code: ResCodeEnum;
    data: any;
    message: string;
    constructor(data?: any, code?: ResCodeEnum, message?: string);
}
export declare class ResError {
    code: ResCodeEnum;
    data: any;
    message: string;
    constructor(code?: ResCodeEnum, message?: any, data?: any);
}
