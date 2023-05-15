export interface AxiosReturn {
    status?: number | unknown; // status code for all requests
    res?: AxiosReturnRes; // response from backend for successful responses
    err?: string; // response from backend for error responses
}

export interface AxiosReturnRes {
    [key: string]: any
}
