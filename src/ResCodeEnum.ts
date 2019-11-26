export enum ResCodeEnum {
    // 正常 0
    CORRECT = 0,
    // 通用错误
    GENERAL_ERROR = 1,
    // 自定义错误
    CUSTOM_ERROR = 2,
    // 中间件调用错误
    MIDDLEWARE_ERROR = 5,
    // gRPC调用错误
    INTERFACE_CALL_ERROR = 6,
    // controller调用错误
    CONTROLLER_CALL_ERR = 7,

    // 未登录或超时
    LOGIN_OUT = 401,
    // 权限错误
    NO_PERMISSION = 403,
    // 请求超时
    REQUEST_TIMEOUT = 504,
}