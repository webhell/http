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
}
interface IConfig {
    customData?: Boolean;
    pageIndexKey?: string;
    totalKey?: string;
    dataKey?: string;
    paging?: boolean;
}
export declare enum FetchStatus {
    INIT = -1,
    GENERAL_ERROR = 1,
    SUCCESS = 200,
    LOADING = 999
}
export declare function createModel(options?: {}, paging?: boolean): IModel;
export declare enum FetchType {
    INIT = "init",
    REFRESH = "refresh",
    UPDATE = "update",
    PULLDOWN = "pulldown",
    PULLUP = "pullup"
}
export declare function fetchPromise(fetchType: FetchType, promiseHandler: (scope: any, fetchType: FetchType) => Promise<any>, useModel: () => [() => IModel, (m: IModel) => IModel | undefined], config?: IConfig): Promise<any>;
export {};
