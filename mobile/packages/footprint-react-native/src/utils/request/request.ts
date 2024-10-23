import { API_BASE_URL } from 'src/utils/constants';
import { keysToCamelCase, keysToSnakeCase } from './utils/transform-data';

export type ApiErrorDetails<E> = E & {
  message: string;
  code?: string;
};

export class ApiError<E> extends Error {
  details: ApiErrorDetails<E>;

  constructor(message: string, errorDetails: ApiErrorDetails<E>) {
    super(message);
    this.name = 'ApiError';
    this.details = errorDetails;
  }
}

type Options = Omit<RequestInit, 'headers'> & {
  baseURL?: string;
  data?: Record<string, unknown>;
  params?: Record<string, unknown>;
  headers?: Record<string, string | undefined>;
  url: string;
  disableCaseConverter?: boolean;
};

function convertToRecordString(input: Record<string, unknown>): Record<string, string> {
  const output: Record<string, string> = {};
  for (const key in input) {
    if (Object.hasOwnProperty.call(input, key)) {
      output[key] = String(input[key]);
    }
  }
  return output;
}

async function request<T>(options: Options): Promise<T> {
  const { baseURL = API_BASE_URL, url, headers = {}, params, data, disableCaseConverter, ...otherOptions } = options;

  const snakeCaseData = data ? keysToSnakeCase(data, disableCaseConverter) : undefined;
  const snakeCaseParams = params ? keysToSnakeCase(params, disableCaseConverter) : {};
  const queryParams = new URLSearchParams(convertToRecordString(snakeCaseParams));
  const requestHeaders = new Headers({
    'Content-Type': 'application/json',
    Accept: 'application/json',
  });
  Object.entries(headers).forEach(([key, value]) => {
    if (value) {
      requestHeaders.set(key, value);
    }
  });
  const response = await fetch(`${baseURL}${url}?${queryParams}`, {
    ...otherOptions,
    headers: requestHeaders,
    body: snakeCaseData ? JSON.stringify(snakeCaseData) : undefined,
  });

  if (!response.ok) {
    const errorBody = await response.json();
    if (errorBody.message) {
      throw new ApiError(response.statusText, errorBody);
    }
    throw Error(response.statusText);
  }
  const jsonResponse = await response.json();
  return disableCaseConverter ? jsonResponse : keysToCamelCase(jsonResponse);
}

export default request;
