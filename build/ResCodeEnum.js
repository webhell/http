"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ResCodeEnum;
(function (ResCodeEnum) {
    // 正常 0
    ResCodeEnum[ResCodeEnum["CORRECT"] = 0] = "CORRECT";
    // 通用错误
    ResCodeEnum[ResCodeEnum["GENERAL_ERROR"] = 1] = "GENERAL_ERROR";
    // 自定义错误
    ResCodeEnum[ResCodeEnum["CUSTOM_ERROR"] = 2] = "CUSTOM_ERROR";
    // 中间件调用错误
    ResCodeEnum[ResCodeEnum["MIDDLEWARE_ERROR"] = 5] = "MIDDLEWARE_ERROR";
    // gRPC调用错误
    ResCodeEnum[ResCodeEnum["INTERFACE_CALL_ERROR"] = 6] = "INTERFACE_CALL_ERROR";
    // controller调用错误
    ResCodeEnum[ResCodeEnum["CONTROLLER_CALL_ERR"] = 7] = "CONTROLLER_CALL_ERR";
    // 未登录或超时
    ResCodeEnum[ResCodeEnum["LOGIN_OUT"] = 401] = "LOGIN_OUT";
    // 权限错误
    ResCodeEnum[ResCodeEnum["NO_PERMISSION"] = 403] = "NO_PERMISSION";
    // 请求超时
    ResCodeEnum[ResCodeEnum["REQUEST_TIMEOUT"] = 504] = "REQUEST_TIMEOUT";
})(ResCodeEnum = exports.ResCodeEnum || (exports.ResCodeEnum = {}));
