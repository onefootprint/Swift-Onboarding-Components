import { getSessionId } from '@onefootprint/dev-tools';
import { DataIdentifierKeys, isCountryCode } from '@onefootprint/types';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import axios from 'axios';
import applyCaseMiddleware from 'axios-case-converter';
import { useTranslation } from 'react-i18next';

type Obj = Record<string, unknown>;
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

const uuidPattern =
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/g;

const clientVersion = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
  ? `frontend-${process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA}`
  : 'unknown';

const LOGOUT_ERROR_CODES = ['E117', 'E118', 'E119'];
// TODO (belce): retire matching on exact error string
const LOGOUT_ERRORS = [
  'Session does not exist',
  'Session is expired',
  'Session invalid',
];

const isObject = (x: unknown): x is Obj => typeof x === 'object' && !!x;
const isString = (x: unknown): x is string => typeof x === 'string' && !!x;

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
  if (serverError?.statusCode !== 401) {
    return false;
  }
  const codeMatches = LOGOUT_ERROR_CODES.some(
    code => serverError?.code === code,
  );
  const messageMatches = LOGOUT_ERRORS.some(e =>
    serverError?.message?.includes(e),
  );
  return codeMatches || messageMatches;
};

const extractStringProps = (x: unknown, acc: string[] = []): string[] => {
  if (isString(x)) return [x];
  if (isObject(x)) {
    for (const key in x) {
      if (isString(x[key])) {
        acc.push(x[key] as string);
      } else if (isObject(x[key])) {
        extractStringProps(x[key] as Obj, acc);
      }
    }
  }

  return acc;
};

export const getErrorMessage = (error?: unknown | Error): string => {
  if (typeof error === 'string') {
    return error;
  }
  if (isFootprintError(error) && error?.response?.data?.error?.message) {
    return isString(error?.response?.data?.error?.message)
      ? error.response.data.error.message
      : extractStringProps(error.response.data.error.message)
          .filter(x => !x.match(uuidPattern))
          .join('') || '';
  }
  if (isUnhandledError(error) && isString(error.message)) {
    return error.message;
  }

  return (
    extractStringProps(error)
      .filter(x => !x.match(uuidPattern))
      .join('') || 'Something went wrong'
  );
};

export const useRequestError = () => {
  const { t, i18n } = useTranslation('request', {
    keyPrefix: 'errors',
  });

  const isValidErrorCode = (code?: string) =>
    !!code?.match(/^E[0-9]+$/g) && i18n.exists(`request:errors.${code}`);

  const getContext = (
    error?: unknown | Error,
  ): Partial<Record<string, string>> => {
    if (isFootprintError(error)) {
      const data = error?.response?.data?.error;
      const errorContext = data?.context;
      return errorContext || {};
    }
    return {};
  };

  const getMessage = (error?: unknown | Error): string => {
    if (typeof error === 'string') {
      return error;
    }
    const unknownError = t('unknown');
    if (isFootprintError(error)) {
      const data = error?.response?.data?.error;
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
    const data = error?.response?.data?.error;
    const errorCode = data?.code;
    if (errorCode) {
      return errorCode;
    }
    return undefined;
  };

  return {
    getErrorMessage: getMessage,
    getErrorCode: getCode,
    getErrorContext: getContext,
  };
};

const getRequestOptions = (
  requestConfig: AxiosRequestConfig,
  extraOptions: { omitSessionId?: boolean } = {},
) => {
  const sessionId = getSessionId();
  return {
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 60000,
    withCredentials: true,
    ...requestConfig,
    headers: {
      'x-fp-session-id': extraOptions.omitSessionId ? undefined : sessionId,
      'x-fp-client-version': clientVersion,
      ...requestConfig.headers,
    },
  };
};

// Disable transformation when the string matched or satisfied the condition.
// https://github.com/mpyw/axios-case-converter#preservedkeys-string--function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const preservedKeys = (input: any) =>
  [...DataIdentifierKeys].includes(input) ||
  input.startsWith('card') ||
  isCountryCode(input);

const request = <Response = unknown>(
  requestConfig: AxiosRequestConfig = {},
  extraOptions: { omitSessionId?: boolean } = {},
) => {
  const client = applyCaseMiddleware(axios.create(), { preservedKeys });
  const options = getRequestOptions(requestConfig, extraOptions);
  return client.request<Response>(options);
};

export const requestWithoutCaseConverter = <Response = unknown>(
  requestConfig: AxiosRequestConfig = {},
) => {
  const client = axios.create();
  const options = getRequestOptions(requestConfig);
  return client.request<Response>(options);
};

export { axios as baseRequest };

export default request;
