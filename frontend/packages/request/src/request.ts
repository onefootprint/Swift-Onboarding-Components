import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import applyCaseMiddleware from 'axios-case-converter';

export type RequestError = AxiosError<{
  error: {
    message: string;
  };
}>;

export type RequestResponse<T> = AxiosResponse<T>;

export type RequestSuccess<T> = {
  data: T;
};

export const isFootprintError = (error: unknown): error is RequestError =>
  (error as RequestError).response?.statusText !== undefined;

export const getErrorMessage = (error: RequestError): string =>
  error.response?.data.error.message || error.message;

const request = <TData = any>(requestConfig: AxiosRequestConfig = {}) => {
  console.log('api base url', process.env.NEXT_PUBLIC_API_BASE_URL);
  console.log('NEXT_PUBLIC_VERCEL_ENV', process.env.NEXT_PUBLIC_VERCEL_ENV);
  console.log(
    'NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF',
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF,
  );

  const client = applyCaseMiddleware(axios.create());
  return client.request<TData, RequestResponse<TData>>({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 60000,
    withCredentials: true,
    ...requestConfig,
  });
};

export default request;
