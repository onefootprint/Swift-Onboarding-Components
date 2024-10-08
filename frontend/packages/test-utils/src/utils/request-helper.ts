import { rest } from 'msw';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const combineURL = (baseURL: string, relativeURL: string) =>
  relativeURL ? `${baseURL.replace(/\/+$/, '')}/${relativeURL.replace(/^\/+/, '')}` : baseURL;

export type RequestMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options';

export type RequestParams = {
  delay?: number;
  fullPath?: boolean;
  method?: RequestMethod;
  path: string;
  queryParams?: URLSearchParams;
  statusCode?: number;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  response: any;
  once?: boolean;
  /** Called with information from the mocked request. Can be used to check the HTTP body, headers, and query params in the request. */
  onRequest?: (args: OnRequestCalledArgs) => void;
};

export type OnRequestCalledArgs = {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  body: any;
  headers: Record<string, string>;
  queryParams: URLSearchParams;
};

const requestHelper = ({
  delay = 5,
  statusCode = 200,
  fullPath = false,
  method = 'get',
  path,
  queryParams,
  response,
  onRequest,
  once,
}: RequestParams) => {
  const caller = rest[method];
  const URL = fullPath ? path : combineURL(API_BASE_URL ?? '', path);
  return caller(URL, async (req, res, ctx) => {
    if (queryParams) {
      const gotParams = new URLSearchParams(req.url.searchParams);
      const wantParams = new URLSearchParams(queryParams);
      gotParams.sort();
      wantParams.sort();
      if (gotParams.toString() !== wantParams.toString()) {
        console.warn('request query string matcher passing through', {
          url: URL,
          got: gotParams.toString(),
          want: wantParams.toString(),
        });
        return req.passthrough();
      }
    }

    if (onRequest) {
      const body = await req.json();
      const headers = req.headers.all();
      const queryParams = new URLSearchParams(req.url.searchParams);
      onRequest({
        body,
        headers,
        queryParams,
      });
    }

    const args = [ctx.status(statusCode), ctx.delay(delay), ctx.json(response)];
    return once ? res.once(...args) : res(...args);
  });
};

export default requestHelper;
