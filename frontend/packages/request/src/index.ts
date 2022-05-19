import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from 'global-constants';

export type RequestError = AxiosError;

export type RequestResponse<T> = AxiosResponse<T>;

export type RequestSuccess<T> = {
  data: T;
};

const request = <TData = any>(requestConfig: AxiosRequestConfig = {}) =>
  axios.request<TData, RequestResponse<TData>>({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    withCredentials: true,
    ...requestConfig,
  });

export default request;
