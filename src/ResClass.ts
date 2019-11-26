import { ResCodeEnum } from './ResCodeEnum';
// 正确的返回数据
export class ResJson {
    code: ResCodeEnum;
    data: any;
    message: string;
    constructor(data: any = null, code: ResCodeEnum = ResCodeEnum.CORRECT, message: string = '') {
        this.code = code;
        this.data = data;
        this.message = message
    }
}
function getErrorMessage(message: any): string {
    let errMsg: string;
    if (typeof message === "object") {
        if (message.details !== undefined && typeof message.details === "string") {
            errMsg = message.details;
        }
        else if (message.message !== undefined && typeof message.message === "string") {
            errMsg = message.message;
        }
        else {
            errMsg = "未知错误";
        }
    }
    else if (typeof message === "string") {
        errMsg = message;
    }
    else {
        errMsg = "未知错误";
    }
    return errMsg;
}
// 错误的返回数据
export class ResError {
    code: ResCodeEnum;
    data: any;
    message: string;
    constructor(code: ResCodeEnum = ResCodeEnum.GENERAL_ERROR,  message: any = '', data: any = '' ) {
        let errMsg = getErrorMessage(message);
        this.code = code;
        this.data = data;
        this.message = errMsg;
    }
}