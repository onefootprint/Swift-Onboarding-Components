import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import applyCaseMiddleware from 'axios-case-converter';
import { API_BASE_URL, API_TIMEOUT } from 'global-constants';

export type RequestError = {
  error: { message?: string };
};

export type RequestResponse<T> = AxiosResponse<T>;

export type RequestSuccess<T> = {
  data: T;
};

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
