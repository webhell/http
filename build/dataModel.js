"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
;
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
function createModelSimple(options = {}) {
    return Object.assign({ loading: false, loadStatus: FetchStatus.INIT, cancelToken: null, data: {}, timestamp: 0 }, options);
}
exports.createModelSimple = createModelSimple;
;
function createModelList(options = {}) {
    return Object.assign({ pageIndex: 1, pageSize: 10, total: 0 }, createModelSimple(options));
}
exports.createModelList = createModelList;
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
function fetchPromiseSimple(fetchType, promiseHandler, useModel, config = {}) {
    const [getState, setState] = useModel();
    return new Promise((resolve, reject) => {
        const scope = createModelSimple(getState());
        if (scope.loadStatus === FetchStatus.LOADING) {
            // isCancel
            if (scope.cancelToken && (fetchType === FetchType.REFRESH || fetchType === FetchType.PULLDOWN)) {
                scope.cancelToken.exec('fetchMsg:cancelToken');
                setTimeout(() => {
                    // next
                    const state = Object.assign(Object.assign({}, scope), { loadStatus: FetchStatus.LOADING, loading: true });
                    setState(state);
                    resolve(promiseHandler(state, fetchType));
                    return;
                }, 17);
                return;
            }
            else {
                reject(new _1.ResError(_1.ResCodeEnum.CUSTOM_ERROR, 'fetchMsg:loading'));
                return;
            }
        }
        const state = Object.assign(Object.assign({}, scope), { loadStatus: FetchStatus.LOADING, loading: true });
        setState(state);
        resolve(promiseHandler(state, fetchType));
    }).then((res) => {
        console.log(`simple fetch ==> `, res);
        const { customData } = config;
        let state = Object.assign(Object.assign({}, getState()), { loadStatus: FetchStatus.SUCCESS, loading: false, cancelToken: null, timestamp: Date.now() });
        if (!customData) {
            state.data = res.data;
        }
        setState(state);
        return res;
    }).catch(err => {
        if (/^fetchMsg:/.test(err.message)) {
            // 如果是以下错误的话不需修改状态 fetcheMsg:(isLastPage|cancelToken|loading)
        }
        else {
            const state = Object.assign(Object.assign({}, getState()), { cancelToken: null, loadStatus: FetchStatus.GENERAL_ERROR, loading: false, __code: err.code });
            setState(state);
        }
    });
}
exports.fetchPromiseSimple = fetchPromiseSimple;
function fetchPromiseList(fetchType, promiseHandler, useModel, config = {}) {
    const [getState, setState] = useModel();
    return new Promise((resolve, reject) => {
        const scope = createModelList(getState());
        if (fetchType === FetchType.UPDATE || fetchType === FetchType.PULLUP) {
            if (scope.total <= (scope.pageIndex - 1) * scope.pageSize) {
                reject(new _1.ResError(_1.ResCodeEnum.CUSTOM_ERROR, 'fetcheMsg:isLastPage'));
                return;
            }
        }
        else {
            // 重置页数
            scope.pageIndex = 1;
            // scope.total = 0;
        }
        if (scope.loadStatus === FetchStatus.LOADING) {
            // isCancel
            if (scope.cancelToken && (fetchType === FetchType.REFRESH || fetchType === FetchType.PULLDOWN)) {
                scope.cancelToken.exec('fetchMsg:cancelToken');
                setTimeout(() => {
                    // next
                    const state = Object.assign(Object.assign({}, scope), { loadStatus: FetchStatus.LOADING, loading: true });
                    setState(state);
                    resolve(promiseHandler(state, fetchType));
                    return;
                }, 17);
                return;
            }
            else {
                reject(new _1.ResError(_1.ResCodeEnum.CUSTOM_ERROR, 'fetchMsg:loading'));
                return;
            }
        }
        const state = Object.assign(Object.assign({}, scope), { loadStatus: FetchStatus.LOADING, loading: true });
        setState(state);
        resolve(promiseHandler(state, fetchType));
    }).then((res) => {
        console.log(`list fetch ==> `, res);
        const { customData, pageIndexKey = 'pageIndex', totalKey = 'total', dataKey } = config;
        let state = Object.assign(Object.assign({}, getState()), { loadStatus: FetchStatus.SUCCESS, loading: false, cancelToken: null, timestamp: Date.now(), pageIndex: res.data[pageIndexKey], total: res.data[totalKey] });
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
            state.data = (fetchType === FetchType.PULLUP ? state.data : []).concat(list || []);
        }
        setState(state);
        return res;
    }).catch(err => {
        if (/^fetchMsg:/.test(err.message)) {
            // 如果是以下错误的话不需修改状态 fetcheMsg:(isLastPage|cancelToken|loading)
        }
        else {
            const state = Object.assign(Object.assign({}, getState()), { cancelToken: null, loadStatus: FetchStatus.GENERAL_ERROR, loading: false, __code: err.code });
            setState(state);
        }
    });
}
exports.fetchPromiseList = fetchPromiseList;
