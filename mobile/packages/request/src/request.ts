import { DataIdentifierKeys } from '@onefootprint/types';
import type { AxiosError, AxiosRequestConfig as RequestConfig } from 'axios';
import axios from 'axios';
import applyCaseMiddleware from 'axios-case-converter';

export type FootprintServerError = {
  message: string;
  code?: string; // Translation code for resolving the erorr to the correct language
  context?: Record<string, string>; // Additional data needed to resolve the error string
  statusCode: number;
  supportId: string;
};

export type RequestError = AxiosError<{
  error: FootprintServerError;
}>;

export type PaginatedRequestResponse<T> = {
  data: T;
  meta: {
    next?: string | null;
    nextPage?: string | null;
    count: number;
  };
};
const preservedKeys = [...DataIdentifierKeys];

export const isFootprintError = (error: unknown): error is RequestError =>
  (error as RequestError)?.response?.data !== undefined;

export const isUnhandledError = (error: unknown): error is Error =>
  (error as Error)?.message !== undefined;

export const isFootprintServerError = (
  error: unknown,
): FootprintServerError | undefined => {
  const errorData = (error as RequestError).response?.data?.error;
  if (errorData?.message && errorData?.statusCode && errorData?.supportId) {
    return errorData;
  }
  return undefined;
};

export const getErrorMessage = (error?: unknown | Error): string => {
  if (isFootprintError(error)) {
    if (error?.response?.data?.error?.message) {
      return error.response.data.error.message;
    }
  }
  if (isUnhandledError(error)) {
    return error.message;
  }
  return 'Something went wrong';
};

const getRequestOptions = (requestConfig: RequestConfig) => {
  return {
    baseURL: process.env.API_BASE_URL ?? 'https://api.onefootprint.com',
    timeout: 60000,
    withCredentials: true,
    ...requestConfig,
    headers: {
      ...requestConfig.headers,
    },
  };
};

export const client = applyCaseMiddleware(axios.create(), { preservedKeys });

const request = <Response = any>(requestConfig: RequestConfig = {}) => {
  const options = getRequestOptions(requestConfig);
  return client.request<Response>(options);
};

export const requestWithoutCaseConverter = <Response = unknown>(
  requestConfig: RequestConfig = {},
) => {
  const clientWithCaseApplied = axios.create();
  const options = getRequestOptions(requestConfig);
  return clientWithCaseApplied.request<Response>(options);
};

export default request;
