import { ResError, ResCodeEnum } from ".";

export enum FetchStatus {
    // 初始值
    INIT = -1,
    // 通用错误
    GENERAL_ERROR = 1,
    // 成功
    SUCCESS = 200,
    // 请求中
    LOADING = 999,
};

// 请求数据模型
export function createModelSimple(options = {}) {
    return {
        loadStatus: FetchStatus.INIT,
        cancelToken: null,
        data: {},
        timestamp: 0,
        ...options
    }
};

export function createModelList(options = {}) {
    return {
        pageIndex: 1,
        pageSize: 10,
        total: 0,
        ...createModelSimple(options)
    }
};

function getTarget(vm: any, propertyName: string, preTarget = false) {
    try {
        const r = propertyName.split('.');
        return (preTarget ? r.slice(0, -1) : r).reduce((pre, x) => x ? pre[x] : pre, vm);
    } catch (e) {
        console.error('get target error');
        return vm;
    }
}
// 设置数据
function setData(vm: any, propertyName: string, value: any) {
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
    } catch (e) {
        console.error(e);
        return false;
    }
};

export enum FetchType {
    // 首次加载数据
    INIT = 'init',
    // 分页刷新数据--页码重置到第一页
    REFRESH = 'refresh',
    // 分页更新数据--页码不变动
    UPDATE = 'update',
}

interface IConfig {
    customData?: Boolean,
    pageIndexKey?: string,
    totalKey?: string,
    dataKey?: string,
}
export function fetchPromiseSimple(
    fetchType: FetchType,
    promiseHandler: (scope: any, fetchType: FetchType) => Promise<any>,
    vm: any,
    propertyName: string,
    config: IConfig = {}): Promise<any> {
    return new Promise((resolve, reject) => {
        const target = getTarget(vm, propertyName);
        const scope = createModelSimple(target);
        if (scope.loadStatus === FetchStatus.LOADING) {
            // isCancel
            if (scope.cancelToken && fetchType === FetchType.REFRESH) {
                (scope.cancelToken as any).exec('fetchMsg:cancelToken');
                setTimeout(() => {
                    // next
                    setData(vm, `${propertyName}.loadStatus`, FetchStatus.LOADING);
                    resolve(promiseHandler({ ...scope, loadStatus: FetchStatus.LOADING }, fetchType));
                    return;
                }, 17);
                return;
            } else {
                reject(new ResError(ResCodeEnum.CUSTOM_ERROR, 'fetchMsg:loading'));
                return;
            }
        }
        setData(vm, `${propertyName}.loadStatus`, FetchStatus.LOADING);
        resolve(promiseHandler({ ...scope, loadStatus: FetchStatus.LOADING }, fetchType));
    }).then((res: any) => {
        console.log(`simple fetch ==> `, res);
        let temp: any = {
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
        } else {
            setData(vm, propertyName, Object.assign(getTarget(vm, propertyName), {
                cancelToken: null,
                loadStatus: FetchStatus.GENERAL_ERROR,
                __code: err.code
            }))
        }
    })
}

export function fetchPromiseList(
    fetchType: FetchType,
    promiseHandler: (scope: any, fetchType: FetchType) => Promise<any>,
    vm: any,
    propertyName: string,
    config: IConfig = {}): Promise<any> {
    return new Promise((resolve, reject) => {
        const target = getTarget(vm, propertyName);
        const scope = createModelList(target);
        if (fetchType === FetchType.UPDATE) {
            if (scope.total <= (scope.pageIndex - 1) * scope.pageSize) {
                reject(new ResError(ResCodeEnum.CUSTOM_ERROR, 'fetcheMsg:isLastPage'));
                return;
            }
        } else {
            // 重置页数
            Object.assign(scope, {
                pageIndex: 1,
                // total: 0
            });
        }
        if (scope.loadStatus === FetchStatus.LOADING) {
            // isCancel
            if (scope.cancelToken && fetchType === FetchType.REFRESH) {
                (scope.cancelToken as any).exec('fetchMsg:cancelToken');
                setTimeout(() => {
                    // next
                    setData(vm, `${propertyName}.loadStatus`, FetchStatus.LOADING);
                    resolve(promiseHandler({ ...scope, loadStatus: FetchStatus.LOADING }, fetchType));
                    return;
                }, 17);
                return;
            } else {
                reject(new ResError(ResCodeEnum.CUSTOM_ERROR, 'fetchMsg:loading'));
                return;
            }
        }
        setData(vm, `${propertyName}.loadStatus`, FetchStatus.LOADING);
        resolve(promiseHandler({ ...scope, loadStatus: FetchStatus.LOADING }, fetchType));
    }).then((res: any) => {
        console.log(`list fetch ==> `, res);
        const { customData, pageIndexKey = 'pageIndex', totalKey = 'total', dataKey } = config;
        let temp: any = {
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
            } else if (typeof res.data.data === 'object') {
                list = res.data.data;
            } else if (typeof res.data.list === 'object') {
                list = res.data.list;
            }
            temp.data = list || [];
        }
        setData(vm, propertyName, Object.assign(getTarget(vm, propertyName), temp));
        return res;
    }).catch(err => {
        if (/^fetchMsg:/.test(err.message)) {
            // 如果是以下错误的话不需修改状态 fetcheMsg:(isLastPage|cancelToken|loading)
        } else {
            setData(vm, propertyName, Object.assign(getTarget(vm, propertyName), {
                cancelToken: null,
                loadStatus: FetchStatus.GENERAL_ERROR,
                __code: err.code
            }))
        }
    })
}

