"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ResCodeEnum_1 = require("./ResCodeEnum");
// 正确的返回数据
class ResJson {
    constructor(data = null, code = ResCodeEnum_1.ResCodeEnum.CORRECT, message = '') {
        this.code = code;
        this.data = data;
        this.message = message;
    }
}
exports.ResJson = ResJson;
function getErrorMessage(message) {
    let errMsg;
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
class ResError {
    constructor(code = ResCodeEnum_1.ResCodeEnum.GENERAL_ERROR, message = '', data = '') {
        let errMsg = getErrorMessage(message);
        this.code = code;
        this.data = data;
        this.message = errMsg;
    }
}
exports.ResError = ResError;
