import { ResError } from "./ResClass";
import { ResCodeEnum } from "./ResCodeEnum";

export interface IModel {
    loading: boolean;
    loadStatus: FetchStatus;
    cancelToken?: any;
    data?: any;
    timestamp?: number;
    __code?: any;
    pageIndex?: number;
    pageSize?: number;
    total?: number;
};
interface IConfig {
    customData?: Boolean,
    pageIndexKey?: string,
    totalKey?: string,
    dataKey?: string,
    paging?: boolean,
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
export function createModel(options = {}, paging = false): IModel {
    const md = {
        loading: false,
        loadStatus: FetchStatus.INIT,
        cancelToken: null,
        data: {},
        timestamp: 0,
    };
    const page = {
        data: [], // 分页默认data为array
        pageIndex: 1,
        pageSize: 10,
        total: 0,
    };
    return {
        ...md,
        ...(paging ? page : {}),
        ...options
    };
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

export function fetchPromise(
    fetchType: FetchType,
    promiseHandler: (scope: any, fetchType: FetchType) => Promise<any>,
    useModel: () => [() => IModel, (m: IModel) => IModel | undefined],
    config: IConfig = {}): Promise<any> {
    const [getState, setState] = useModel();
    const { pageIndex, pageSize } = getState();
    const paging = !!config.paging || [pageIndex, pageSize].every(val => val !== undefined);
    return new Promise((resolve, reject) => {
        let scope = createModel(getState(), paging);
        if (paging) {
            if (fetchType === FetchType.UPDATE || fetchType === FetchType.PULLUP) {
                const { total, pageIndex, pageSize }: any = scope;
                if (total <= (pageIndex - 1) * pageSize) {
                    reject(new ResError(ResCodeEnum.CUSTOM_ERROR, 'fetcheMsg:isLastPage'));
                    return;
                }
            } else {
                // 重置页数
                scope.pageIndex = 1;
                // scope.total = 0;
            }
        }
        if (scope.loadStatus === FetchStatus.LOADING) {
            // isCancel
            if (scope.cancelToken && (fetchType === FetchType.REFRESH || fetchType === FetchType.PULLDOWN)) {
                (scope.cancelToken as any).exec('fetchMsg:cancelToken');
                setTimeout(() => {
                    // next
                    scope = { ...scope, loadStatus: FetchStatus.LOADING, loading: true };
                    setState(scope);
                    resolve(promiseHandler(scope, fetchType));
                    return;
                }, 17);
                return;
            } else {
                reject(new ResError(ResCodeEnum.CUSTOM_ERROR, 'fetchMsg:loading'));
                return;
            }
        }
        scope = { ...scope, loadStatus: FetchStatus.LOADING, loading: true };
        setState(scope)
        resolve(promiseHandler(scope, fetchType));
    }).then((res: any) => {
        console.log(`promiseFetch ==> `, res);
        const { customData, pageIndexKey = 'pageIndex', totalKey = 'total', dataKey } = config;
        let scope = {
            ...getState(),
            loadStatus: FetchStatus.SUCCESS,
            loading: false,
            cancelToken: null,
            timestamp: Date.now()
        };
        if (paging) {
            scope = {
                ...scope,
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
                scope.data = (fetchType === FetchType.PULLUP ? scope.data : []).concat(list || []);
            }
        } else {
            if (!customData) {
                scope = { ...scope, data: res.data };
            }
        }
        setState(scope);
        return res;
    }).catch(err => {
        if (/^fetchMsg:/.test(err.message)) {
            // 如果是以下错误的话不需修改状态 fetcheMsg:(isLastPage|cancelToken|loading)
        } else {
            let scope = {
                ...getState(),
                cancelToken: null,
                loadStatus: FetchStatus.GENERAL_ERROR,
                loading: false,
                __code: err.code
            };
            setState(scope);
        }
    })
}
