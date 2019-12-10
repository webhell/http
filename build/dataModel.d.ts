interface IModelSimple {
    loading: boolean;
    loadStatus: FetchStatus;
    cancelToken?: any;
    data?: any;
    timestamp?: number;
    __code?: any;
}
interface IModelList extends IModelSimple {
    pageIndex: number;
    pageSize: number;
    total: number;
}
interface IConfig {
    customData?: Boolean;
    pageIndexKey?: string;
    totalKey?: string;
    dataKey?: string;
}
export declare enum FetchStatus {
    INIT = -1,
    GENERAL_ERROR = 1,
    SUCCESS = 200,
    LOADING = 999
}
export declare function createModelSimple(options?: {}): IModelSimple;
export declare function createModelList(options?: {}): IModelList;
export declare enum FetchType {
    INIT = "init",
    REFRESH = "refresh",
    UPDATE = "update",
    PULLDOWN = "pulldown",
    PULLUP = "pullup"
}
export declare function fetchPromiseSimple(fetchType: FetchType, promiseHandler: (scope: any, fetchType: FetchType) => Promise<any>, useModel: () => [() => IModelSimple, (m: IModelSimple) => IModelSimple], config?: IConfig): Promise<any>;
export declare function fetchPromiseList(fetchType: FetchType, promiseHandler: (scope: any, fetchType: FetchType) => Promise<any>, useModel: () => [() => IModelList, (m: IModelList) => IModelList], config?: IConfig): Promise<any>;
export {};
