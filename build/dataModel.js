"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
;
;
var FetchStatus;
(function (FetchStatus) {
    // 初始值
    FetchStatus[FetchStatus["INIT"] = -1] = "INIT";
    // 通用错误
    FetchStatus[FetchStatus["GENERAL_ERROR"] = 1] = "GENERAL_ERROR";
    // 成功
    FetchStatus[FetchStatus["SUCCESS"] = 200] = "SUCCESS";
    // 请求中
    FetchStatus[FetchStatus["LOADING"] = 999] = "LOADING";
})(FetchStatus = exports.FetchStatus || (exports.FetchStatus = {}));
;
// 请求数据模型
function createModel(options = {}, paging = false) {
    const md = {
        loading: false,
        loadStatus: FetchStatus.INIT,
        cancelToken: null,
        data: {},
        timestamp: 0,
    };
    const page = {
        data: [],
        pageIndex: 1,
        pageSize: 10,
        total: 0,
    };
    return Object.assign(Object.assign(Object.assign({}, md), (paging ? page : {})), options);
}
exports.createModel = createModel;
;
var FetchType;
(function (FetchType) {
    // 首次加载数据
    FetchType["INIT"] = "init";
    // 分页刷新数据--页码重置到第一页
    FetchType["REFRESH"] = "refresh";
    // 分页更新数据--页码不变动
    FetchType["UPDATE"] = "update";
    // 下拉刷新
    FetchType["PULLDOWN"] = "pulldown";
    // 上拉加载更多
    FetchType["PULLUP"] = "pullup";
})(FetchType = exports.FetchType || (exports.FetchType = {}));
function fetchPromise(fetchType, promiseHandler, useModel, config = {}) {
    const [getState, setState] = useModel();
    const { pageIndex, pageSize } = getState();
    const paging = !!config.paging || [pageIndex, pageSize].every(val => val !== undefined);
    return new Promise((resolve, reject) => {
        let scope = createModel(getState(), paging);
        if (paging) {
            if (fetchType === FetchType.UPDATE || fetchType === FetchType.PULLUP) {
                const { total, pageIndex, pageSize } = scope;
                if (total <= (pageIndex - 1) * pageSize) {
                    reject(new _1.ResError(_1.ResCodeEnum.CUSTOM_ERROR, 'fetcheMsg:isLastPage'));
                    return;
                }
            }
            else {
                // 重置页数
                scope.pageIndex = 1;
                // scope.total = 0;
            }
        }
        if (scope.loadStatus === FetchStatus.LOADING) {
            // isCancel
            if (scope.cancelToken && (fetchType === FetchType.REFRESH || fetchType === FetchType.PULLDOWN)) {
                scope.cancelToken.exec('fetchMsg:cancelToken');
                setTimeout(() => {
                    // next
                    scope = Object.assign(Object.assign({}, scope), { loadStatus: FetchStatus.LOADING, loading: true });
                    setState(scope);
                    resolve(promiseHandler(scope, fetchType));
                    return;
                }, 17);
                return;
            }
            else {
                reject(new _1.ResError(_1.ResCodeEnum.CUSTOM_ERROR, 'fetchMsg:loading'));
                return;
            }
        }
        scope = Object.assign(Object.assign({}, scope), { loadStatus: FetchStatus.LOADING, loading: true });
        setState(scope);
        resolve(promiseHandler(scope, fetchType));
    }).then((res) => {
        console.log(`promiseFetch ==> `, res);
        const { customData, pageIndexKey = 'pageIndex', totalKey = 'total', dataKey } = config;
        let scope = Object.assign(Object.assign({}, getState()), { loadStatus: FetchStatus.SUCCESS, loading: false, cancelToken: null, timestamp: Date.now() });
        if (paging) {
            scope = Object.assign(Object.assign({}, scope), { pageIndex: res.data[pageIndexKey], total: res.data[totalKey] });
            if (!customData) {
                let list = [];
                if (dataKey) {
                    list = res.data[dataKey];
                }
                else if (typeof res.data.data === 'object') {
                    list = res.data.data;
                }
                else if (typeof res.data.list === 'object') {
                    list = res.data.list;
                }
                scope.data = (fetchType === FetchType.PULLUP ? scope.data : []).concat(list || []);
            }
        }
        else {
            if (!customData) {
                scope = Object.assign(Object.assign({}, scope), { data: res.data });
            }
        }
        setState(scope);
        return res;
    }).catch(err => {
        if (/^fetchMsg:/.test(err.message)) {
            // 如果是以下错误的话不需修改状态 fetcheMsg:(isLastPage|cancelToken|loading)
        }
        else {
            let scope = Object.assign(Object.assign({}, getState()), { cancelToken: null, loadStatus: FetchStatus.GENERAL_ERROR, loading: false, __code: err.code });
            setState(scope);
        }
    });
}
exports.fetchPromise = fetchPromise;
