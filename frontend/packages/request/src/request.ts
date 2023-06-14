import { getCustomEnvVariable, getSessionId } from '@onefootprint/dev-tools';
import { DataIdentifierKeys } from '@onefootprint/types';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
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

export type PaginatedRequestResponse<T> = {
  data: T;
  meta: {
    next?: string | null;
    nextPage?: string | null;
    count: number;
  };
};

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

export const isLogoutError = (error: unknown) => {
  const serverError = isFootprintServerError(error);
  return !!(
    serverError?.statusCode === 401 &&
    serverError?.message?.includes(LOGOUT_ERROR)
  );
};

export const getErrorMessage = (error?: unknown | Error): string => {
  if (isFootprintError(error)) {
    if (error?.response?.data.error.message) {
      return error.response.data.error.message;
    }
  }
  if (isUnhandledError(error)) {
    return error.message;
  }
  return 'Something went wrong';
};

const getRequestOptions = (
  requestConfig: AxiosRequestConfig,
  extraOptions: { omitSessionId?: boolean } = {},
) => {
  const sessionId = getSessionId();
  return {
    baseURL: getCustomEnvVariable(
      'NEXT_PUBLIC_API_BASE_URL',
      process.env.NEXT_PUBLIC_API_BASE_URL,
    ),
    timeout: 60000,
    withCredentials: true,
    ...requestConfig,
    headers: {
      'x-fp-session-id': extraOptions.omitSessionId ? undefined : sessionId,
      ...requestConfig.headers,
    },
  };
};

// Disable transformation when the string matched or satisfied the condition.
// https://github.com/mpyw/axios-case-converter#preservedkeys-string--function
const preservedKeys = (input: any) =>
  [...DataIdentifierKeys].includes(input) || input.startsWith('card');

const request = <Response = any>(
  requestConfig: AxiosRequestConfig = {},
  extraOptions: { omitSessionId?: boolean } = {},
) => {
  const client = applyCaseMiddleware(axios.create(), { preservedKeys });
  const options = getRequestOptions(requestConfig, extraOptions);
  return client.request<Response>(options);
};

export const requestWithoutCaseConverter = <Response = any>(
  requestConfig: AxiosRequestConfig = {},
) => {
  const client = axios.create();
  const options = getRequestOptions(requestConfig);
  return client.request<Response>(options);
};

export default request;
