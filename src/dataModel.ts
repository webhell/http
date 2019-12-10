import { ResError, ResCodeEnum } from ".";

interface IModelSimple {
    loading: boolean;
    loadStatus: FetchStatus;
    cancelToken?: any;
    data?: any;
    timestamp?: number;
    __code?: any;
};
interface IModelList extends IModelSimple {
    pageIndex: number;
    pageSize: number;
    total: number;
};
interface IConfig {
    customData?: Boolean,
    pageIndexKey?: string,
    totalKey?: string,
    dataKey?: string,
};

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
export function createModelSimple(options = {}): IModelSimple {
    return {
        loading: false,
        loadStatus: FetchStatus.INIT,
        cancelToken: null,
        data: {},
        timestamp: 0,
        ...options
    }
};

export function createModelList(options = {}): IModelList {
    return {
        pageIndex: 1,
        pageSize: 10,
        total: 0,
        ...createModelSimple(options)
    }
};

export enum FetchType {
    // 首次加载数据
    INIT = 'init',
    // 分页刷新数据--页码重置到第一页
    REFRESH = 'refresh',
    // 分页更新数据--页码不变动
    UPDATE = 'update',
    // 下拉刷新
    PULLDOWN = 'pulldown',
    // 上拉加载更多
    PULLUP = 'pullup',
}

export function fetchPromiseSimple(
    fetchType: FetchType,
    promiseHandler: (scope: any, fetchType: FetchType) => Promise<any>,
    useModel: () => [() => IModelSimple, (m: IModelSimple) => IModelSimple],
    config: IConfig = {}): Promise<any> {
    const [getState, setState] = useModel();
    return new Promise((resolve, reject) => {
        const scope = createModelSimple(getState());
        if (scope.loadStatus === FetchStatus.LOADING) {
            // isCancel
            if (scope.cancelToken && (fetchType === FetchType.REFRESH || fetchType === FetchType.PULLDOWN)) {
                (scope.cancelToken as any).exec('fetchMsg:cancelToken');
                setTimeout(() => {
                    // next
                    const state = { ...scope, loadStatus: FetchStatus.LOADING, loading: true };
                    setState(state);
                    resolve(promiseHandler(state, fetchType));
                    return;
                }, 17);
                return;
            } else {
                reject(new ResError(ResCodeEnum.CUSTOM_ERROR, 'fetchMsg:loading'));
                return;
            }
        }
        const state = { ...scope, loadStatus: FetchStatus.LOADING, loading: true };
        setState(state)
        resolve(promiseHandler(state, fetchType));
    }).then((res: any) => {
        console.log(`simple fetch ==> `, res);
        const { customData } = config;
        let state = {
            ...getState(),
            loadStatus: FetchStatus.SUCCESS,
            loading: false,
            cancelToken: null,
            timestamp: Date.now()
        };
        if (!customData) {
            state.data = res.data;
        }
        setState(state);
        return res;
    }).catch(err => {
        if (/^fetchMsg:/.test(err.message)) {
            // 如果是以下错误的话不需修改状态 fetcheMsg:(isLastPage|cancelToken|loading)
        } else {
            const state = {
                ...getState(),
                cancelToken: null,
                loadStatus: FetchStatus.GENERAL_ERROR,
                loading: false,
                __code: err.code
            };
            setState(state);
        }
    })
}

export function fetchPromiseList(
    fetchType: FetchType,
    promiseHandler: (scope: any, fetchType: FetchType) => Promise<any>,
    useModel: () => [() => IModelList, (m: IModelList) => IModelList],
    config: IConfig = {}): Promise<any> {
    const [getState, setState] = useModel();
    return new Promise((resolve, reject) => {
        const scope = createModelList(getState());
        if (fetchType === FetchType.UPDATE || fetchType === FetchType.PULLUP) {
            if (scope.total <= (scope.pageIndex - 1) * scope.pageSize) {
                reject(new ResError(ResCodeEnum.CUSTOM_ERROR, 'fetcheMsg:isLastPage'));
                return;
            }
        } else {
            // 重置页数
            scope.pageIndex = 1;
            // scope.total = 0;
        }
        if (scope.loadStatus === FetchStatus.LOADING) {
            // isCancel
            if (scope.cancelToken && (fetchType === FetchType.REFRESH || fetchType === FetchType.PULLDOWN)) {
                (scope.cancelToken as any).exec('fetchMsg:cancelToken');
                setTimeout(() => {
                    // next
                    const state = { ...scope, loadStatus: FetchStatus.LOADING, loading: true };
                    setState(state);
                    resolve(promiseHandler(state, fetchType));
                    return;
                }, 17);
                return;
            } else {
                reject(new ResError(ResCodeEnum.CUSTOM_ERROR, 'fetchMsg:loading'));
                return;
            }
        }
        const state = { ...scope, loadStatus: FetchStatus.LOADING, loading: true };
        setState(state);
        resolve(promiseHandler(state, fetchType));
    }).then((res: any) => {
        console.log(`list fetch ==> `, res);
        const { customData, pageIndexKey = 'pageIndex', totalKey = 'total', dataKey } = config;
        let state = {
            ...getState(),
            loadStatus: FetchStatus.SUCCESS,
            loading: false,
            cancelToken: null,
            timestamp: Date.now(),
            pageIndex: res.data[pageIndexKey],
            total: res.data[totalKey]
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
            state.data = (fetchType === FetchType.PULLUP ? state.data : []).concat(list || []);
        }
        setState(state);
        return res;
    }).catch(err => {
        if (/^fetchMsg:/.test(err.message)) {
            // 如果是以下错误的话不需修改状态 fetcheMsg:(isLastPage|cancelToken|loading)
        } else {
            const state = {
                ...getState(),
                cancelToken: null,
                loadStatus: FetchStatus.GENERAL_ERROR,
                loading: false,
                __code: err.code
            };
            setState(state);
        }
    })
}

