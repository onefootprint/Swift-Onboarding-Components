import getSessionId from '@onefootprint/dev-tools/src/utils/session-id';

type JsonPrimitive = string | number | boolean | null;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];
type JsonValue = JsonArray | JsonObject | JsonPrimitive;

const EmptyHeader = {} as HeadersInit;
const errors: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Payload Too Large',
  414: 'URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Range Not Satisfiable',
  417: 'Expectation Failed',
  418: "I'm a teapot",
  421: 'Misdirected Request',
  422: 'Unprocessable Entity',
  423: 'Locked',
  424: 'Failed Dependency',
  426: 'Upgrade Required',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  431: 'Request Header Fields Too Large',
  451: 'Unavailable For Legal Reasons',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates',
  507: 'Insufficient Storage',
  508: 'Loop Detected',
  510: 'Not Extended',
  511: 'Network Authentication Required',
};

const camelCaseTransform = (json: JsonValue): JsonValue => {
  if (Array.isArray(json)) return json.map(camelCaseTransform);
  if (typeof json === 'object' && json !== null) {
    const camelCasedObj: JsonObject = {};
    for (const key in json) {
      if (Object.prototype.hasOwnProperty.call(json, key)) {
        const camelCasedKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        camelCasedObj[camelCasedKey] = camelCaseTransform(json[key]);
      }
    }
    return camelCasedObj;
  }
  return json;
};

const getResponseBody = async (response: Response): Promise<JsonValue | string | undefined> => {
  if (response.status !== 204) {
    try {
      const contentType = response.headers.get('Content-Type');
      if (contentType) {
        const isJson = ['application/json', 'application/problem+json'].some(type =>
          contentType.toLowerCase().startsWith(type),
        );
        if (isJson) {
          const json = await response.json();
          return camelCaseTransform(json);
        }
        return await response.text();
      }
    } catch (error) {
      console.error('Error in getResponseBody:', error);
    }
  }
  return undefined;
};

/**
 * Fetches data from the API endpoint specified by the given path using the provided options.
 *
 * @param {string} path - The path of the API endpoint.
 * @param {RequestInit} rest - The options for the fetch request.
 * @return {Promise<T>} - A promise that resolves to the response data.
 */
const baseFetch = async <T>(path: string, rest: RequestInit): Promise<T> => {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`;
  const { headers = EmptyHeader } = rest;
  const fixedHeaders = new Headers({ 'x-fp-session-id': getSessionId() });
  // @ts-ignore: fetch from Next.js is different from the native, Typechecking is failing remotely
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      ...fixedHeaders,
      ...headers,
    },
    ...rest,
  });

  const error = errors[response.status];

  return new Promise((resolve, reject) => {
    if (!response.ok) {
      reject(new Error(response.statusText || 'Failed to fetch data'));
    } else if (error) {
      reject(new Error(error));
    }
    resolve(getResponseBody(response) as Promise<T>);
  });
};

export default baseFetch;
