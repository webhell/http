export declare enum FetchStatus {
    INIT = -1,
    GENERAL_ERROR = 1,
    SUCCESS = 200,
    LOADING = 999
}
export declare function createModelSimple(options?: {}): {
    loadStatus: FetchStatus;
    cancelToken: null;
    data: {};
    timestamp: number;
};
export declare function createModelList(options?: {}): {
    loadStatus: FetchStatus;
    cancelToken: null;
    data: {};
    timestamp: number;
    pageIndex: number;
    pageSize: number;
    total: number;
};
export declare enum FetchType {
    INIT = "init",
    REFRESH = "refresh",
    UPDATE = "update"
}
interface IConfig {
    customData?: Boolean;
    pageIndexKey?: string;
    totalKey?: string;
    dataKey?: string;
}
export declare function fetchPromiseSimple(fetchType: FetchType, promiseHandler: (scope: any, fetchType: FetchType) => Promise<any>, vm: any, propertyName: string, config?: IConfig): Promise<any>;
export declare function fetchPromiseList(fetchType: FetchType, promiseHandler: (scope: any, fetchType: FetchType) => Promise<any>, vm: any, propertyName: string, config?: IConfig): Promise<any>;
export {};
