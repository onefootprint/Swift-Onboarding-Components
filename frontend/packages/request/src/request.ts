import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import applyCaseMiddleware from 'axios-case-converter';

const LOGOUT_ERROR = 'Session expired or does not exist';

export type FootprintServerError = {
  message: string;
  statusCode: number;
  supportId: string;
};

export type RequestError = AxiosError<{
  error: FootprintServerError;
}>;

export type RequestResponse<T> = AxiosResponse<T>;

export type RequestSuccess<T> = {
  data: T;
};

export const isFootprintError = (error: unknown): error is RequestError =>
  (error as RequestError).response?.statusText !== undefined;

export const isFootprintServerError = (
  error: unknown,
): FootprintServerError | undefined => {
  const errorData = (error as RequestError).response?.data?.error;
  if (errorData?.message && errorData?.statusCode && errorData?.supportId) {
    return errorData;
  }
  return undefined;
};

export const isLogoutError = (error: unknown) => {
  const serverError = isFootprintServerError(error);
  return !!(
    serverError?.statusCode === 401 &&
    serverError?.message?.includes(LOGOUT_ERROR)
  );
};

export const getErrorMessage = (error: RequestError): string =>
  error.response?.data.error.message || error.message;

const request = <TData = any>(requestConfig: AxiosRequestConfig = {}) => {
  const client = applyCaseMiddleware(axios.create());
  return client.request<TData, RequestResponse<TData>>({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 60000,
    withCredentials: true,
    ...requestConfig,
  });
};

export default request;
