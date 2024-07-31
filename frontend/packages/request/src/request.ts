import { getSessionId } from '@onefootprint/dev-tools';
import { DataIdentifierKeys, isCountryCode } from '@onefootprint/types';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import axios from 'axios';
import applyCaseMiddleware from 'axios-case-converter';
import { useTranslation } from 'react-i18next';

type Obj = Record<string, unknown>;
export type RequestError = AxiosError<FootprintServerError>;
export type FootprintServerError = {
  message: string;
  code?: string; // Translation code for resolving the error to the correct language
  context?: Record<string, string>; // Additional data needed to resolve the error string
  statusCode: number;
  supportId: string;
};

export type PaginatedRequestResponse<T> = {
  data: T;
  meta: {
    next?: string | null;
    nextPage?: string | null;
    count: number;
  };
};

const uuidPattern = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/g;

const clientVersion = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
  ? `frontend-${process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA}`
  : 'unknown';

const LOGOUT_ERROR_CODES = ['E117', 'E118', 'E119'];

const isObject = (x: unknown): x is Obj => typeof x === 'object' && !!x;
const isString = (x: unknown): x is string => typeof x === 'string' && !!x;

export const isFootprintError = (err: unknown): err is RequestError =>
  typeof err === 'object' &&
  err != null &&
  'response' in err &&
  typeof err.response === 'object' &&
  err.response != null &&
  'data' in err.response;

export const isUnhandledError = (err: unknown): err is Error =>
  typeof err === 'object' && err != null && 'message' in err && typeof err.message === 'string';

export const isLogoutError = (error: unknown) => {
  if (!isFootprintError(error)) return undefined;
  const err = error?.response?.data as FootprintServerError;
  return LOGOUT_ERROR_CODES.some(code => err?.code === code);
};

const extractStringProps = (x: unknown, acc: string[] = []): string[] => {
  const stack = [x];

  while (stack.length > 0) {
    const current = stack.pop();

    if (isString(current)) {
      acc.push(current);
    } else if (isObject(current)) {
      for (const key in current) {
        if (Object.prototype.hasOwnProperty.call(current, key)) {
          stack.push(current[key]);
        }
      }
    }
  }

  return acc;
};

export const getErrorMessage = (error?: unknown | Error): string => {
  if (isString(error)) return error.trim();
  if (isFootprintError(error) && error?.response?.data?.message && isString(error?.response?.data?.message)) {
    return error.response.data.message.trim();
  }
  if (isUnhandledError(error) && isString(error.message)) {
    return error.message.trim();
  }

  return (
    extractStringProps(error)
      .filter(x => !x.match(uuidPattern))
      .join('')
      .trim() || 'Something went wrong'
  );
};

export const useRequestError = () => {
  const { t, i18n } = useTranslation('request', { keyPrefix: 'errors' });

  const isValidErrorCode = (code?: string) => !!code?.match(/^E[0-9]+$/g) && i18n.exists(`request:errors.${code}`);

  const getContext = (error?: unknown | Error): Partial<Record<string, string>> => {
    if (isFootprintError(error)) {
      const data = error?.response?.data;
      const errorContext = data?.context;
      return errorContext || {};
    }
    return {};
  };

  const getMessage = (error?: unknown | Error): string => {
    if (isString(error)) return error;

    const unknownError = t('unknown');
    if (isFootprintError(error)) {
      const data = error?.response?.data;
      const errorCode = data?.code;
      const errorContext = data?.context;
      const errorMessage = data?.message;

      if (!errorCode || !isValidErrorCode(errorCode)) {
        return errorMessage ?? unknownError;
      }
      if (!errorContext) {
        // @ts-ignore:next-line
        return t(errorCode) ?? unknownError;
      }
      // @ts-ignore:next-line
      return t(errorCode, errorContext) ?? unknownError;
    }

    if (isUnhandledError(error)) {
      return error.message;
    }
    return unknownError;
  };

  const getCode = (error?: unknown | Error): string | undefined => {
    if (!error || !isFootprintError(error)) {
      return undefined;
    }
    const data = error?.response?.data;
    const errorCode = data?.code;
    if (errorCode) {
      return errorCode;
    }
    return undefined;
  };

  const getStatusCode = (error?: unknown | Error): number | undefined => {
    if (!error || !isFootprintError(error)) {
      return undefined;
    }
    const statusCode = error?.response?.status;
    if (statusCode) {
      return statusCode;
    }
    return undefined;
  };

  return {
    getErrorMessage: getMessage,
    getErrorCode: getCode,
    getErrorContext: getContext,
    getErrorStatusCode: getStatusCode,
  };
};

const getRequestOptions = (
  requestConfig: AxiosRequestConfig,
  extraOptions: { omitSessionId?: boolean; omitClientVersion?: boolean } = {},
) => {
  const sessionId = getSessionId();
  return {
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 60000,
    withCredentials: true,
    ...requestConfig,
    headers: {
      'x-fp-session-id': extraOptions.omitSessionId ? undefined : sessionId,
      'x-fp-client-version': extraOptions.omitClientVersion ? undefined : clientVersion,
      ...requestConfig.headers,
    },
  };
};

// Disable transformation when the string matched or satisfied the condition.
// https://github.com/mpyw/axios-case-converter#preservedkeys-string--function
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const preservedKeys = (input: any) =>
  [...DataIdentifierKeys].includes(input) || input.startsWith('card') || isCountryCode(input);

const request = <Response = unknown>(
  requestConfig: AxiosRequestConfig = {},
  extraOptions: { omitSessionId?: boolean; omitClientVersion?: boolean } = {},
) => {
  const client = applyCaseMiddleware(axios.create(), { preservedKeys });
  const options = getRequestOptions(requestConfig, extraOptions);
  return client.request<Response>(options);
};

export const requestWithoutCaseConverter = <Response = unknown>(requestConfig: AxiosRequestConfig = {}) => {
  const client = axios.create();
  const options = getRequestOptions(requestConfig);
  return client.request<Response>(options);
};

export { axios as baseRequest };

export default request;
