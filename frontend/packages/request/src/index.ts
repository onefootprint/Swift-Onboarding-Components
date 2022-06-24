import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import applyCaseMiddleware from 'axios-case-converter';
import { API_BASE_URL, API_TIMEOUT } from 'global-constants';

export type RequestError = AxiosError<{}>;

export type RequestResponse<T> = AxiosResponse<T>;

export type RequestSuccess<T> = {
  data: T;
};

export const isFootprintError = (error: unknown): error is RequestError =>
  (error as RequestError).response?.statusText !== undefined;

const request = <TData = any>(requestConfig: AxiosRequestConfig = {}) => {
  const client = applyCaseMiddleware(axios.create());
  return client.request<TData, RequestResponse<TData>>({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    withCredentials: true,
    ...requestConfig,
  });
};

export default request;
