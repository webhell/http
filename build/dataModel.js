"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
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
    return Object.assign({ loadStatus: FetchStatus.INIT, cancelToken: null, data: {}, timestamp: 0 }, options);
}
exports.createModelSimple = createModelSimple;
;
function createModelList(options = {}) {
    return Object.assign({ pageIndex: 1, pageSize: 10, total: 0 }, createModelSimple(options));
}
exports.createModelList = createModelList;
;
function getTarget(vm, propertyName, preTarget = false) {
    try {
        const r = propertyName.split('.');
        return (preTarget ? r.slice(0, -1) : r).reduce((pre, x) => x ? pre[x] : pre, vm);
    }
    catch (e) {
        console.error('get target error');
        return vm;
    }
}
// 设置数据
function setData(vm, propertyName, value) {
    try {
        if (typeof vm.setData === 'function') {
            const target = vm;
            vm.setData(target, propertyName, value);
        }
        if (typeof vm.$set === 'function') {
            const target = getTarget(vm, propertyName, true);
            propertyName = propertyName.split('.').slice(-1)[0];
            vm.$set(target, propertyName, value);
        }
        return true;
    }
    catch (e) {
        console.error(e);
        return false;
    }
}
;
var FetchType;
(function (FetchType) {
    // 首次加载数据
    FetchType["INIT"] = "init";
    // 分页刷新数据--页码重置到第一页
    FetchType["REFRESH"] = "refresh";
    // 分页更新数据--页码不变动
    FetchType["UPDATE"] = "update";
})(FetchType = exports.FetchType || (exports.FetchType = {}));
function fetchPromiseSimple(fetchType, promiseHandler, vm, propertyName, config = {}) {
    return new Promise((resolve, reject) => {
        const target = getTarget(vm, propertyName);
        const scope = createModelSimple(target);
        if (scope.loadStatus === FetchStatus.LOADING) {
            // isCancel
            if (scope.cancelToken && fetchType === FetchType.REFRESH) {
                scope.cancelToken.exec('fetchMsg:cancelToken');
                setTimeout(() => {
                    // next
                    setData(vm, `${propertyName}.loadStatus`, FetchStatus.LOADING);
                    resolve(promiseHandler(Object.assign(Object.assign({}, scope), { loadStatus: FetchStatus.LOADING }), fetchType));
                    return;
                }, 17);
                return;
            }
            else {
                reject(new _1.ResError(_1.ResCodeEnum.CUSTOM_ERROR, 'fetchMsg:loading'));
                return;
            }
        }
        setData(vm, `${propertyName}.loadStatus`, FetchStatus.LOADING);
        resolve(promiseHandler(Object.assign(Object.assign({}, scope), { loadStatus: FetchStatus.LOADING }), fetchType));
    }).then((res) => {
        console.log(`simple fetch ==> `, res);
        let temp = {
            loadStatus: FetchStatus.SUCCESS,
            cancelToken: null,
            timestamp: Date.now()
        };
        const { customData } = config;
        if (!customData) {
            temp.data = res.data;
        }
        setData(vm, propertyName, Object.assign(getTarget(vm, propertyName), temp));
        return res;
    }).catch(err => {
        if (/^fetchMsg:/.test(err.message)) {
            // 如果是以下错误的话不需修改状态 fetcheMsg:(isLastPage|cancelToken|loading)
        }
        else {
            setData(vm, propertyName, Object.assign(getTarget(vm, propertyName), {
                cancelToken: null,
                loadStatus: FetchStatus.GENERAL_ERROR,
                __code: err.code
            }));
        }
    });
}
exports.fetchPromiseSimple = fetchPromiseSimple;
function fetchPromiseList(fetchType, promiseHandler, vm, propertyName, config = {}) {
    return new Promise((resolve, reject) => {
        const target = getTarget(vm, propertyName);
        const scope = createModelList(target);
        if (fetchType === FetchType.UPDATE) {
            if (scope.total <= (scope.pageIndex - 1) * scope.pageSize) {
                reject(new _1.ResError(_1.ResCodeEnum.CUSTOM_ERROR, 'fetcheMsg:isLastPage'));
                return;
            }
        }
        else {
            // 重置页数
            Object.assign(scope, {
                pageIndex: 1,
            });
        }
        if (scope.loadStatus === FetchStatus.LOADING) {
            // isCancel
            if (scope.cancelToken && fetchType === FetchType.REFRESH) {
                scope.cancelToken.exec('fetchMsg:cancelToken');
                setTimeout(() => {
                    // next
                    setData(vm, `${propertyName}.loadStatus`, FetchStatus.LOADING);
                    resolve(promiseHandler(Object.assign(Object.assign({}, scope), { loadStatus: FetchStatus.LOADING }), fetchType));
                    return;
                }, 17);
                return;
            }
            else {
                reject(new _1.ResError(_1.ResCodeEnum.CUSTOM_ERROR, 'fetchMsg:loading'));
                return;
            }
        }
        setData(vm, `${propertyName}.loadStatus`, FetchStatus.LOADING);
        resolve(promiseHandler(Object.assign(Object.assign({}, scope), { loadStatus: FetchStatus.LOADING }), fetchType));
    }).then((res) => {
        console.log(`list fetch ==> `, res);
        const { customData, pageIndexKey = 'pageIndex', totalKey = 'total', dataKey } = config;
        let temp = {
            loadStatus: FetchStatus.SUCCESS,
            cancelToken: null,
            timestamp: Date.now(),
            pageIndex: res.data[pageIndexKey],
            total: res.data[totalKey],
        };
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
            temp.data = list || [];
        }
        setData(vm, propertyName, Object.assign(getTarget(vm, propertyName), temp));
        return res;
    }).catch(err => {
        if (/^fetchMsg:/.test(err.message)) {
            // 如果是以下错误的话不需修改状态 fetcheMsg:(isLastPage|cancelToken|loading)
        }
        else {
            setData(vm, propertyName, Object.assign(getTarget(vm, propertyName), {
                cancelToken: null,
                loadStatus: FetchStatus.GENERAL_ERROR,
                __code: err.code
            }));
        }
    });
}
exports.fetchPromiseList = fetchPromiseList;
