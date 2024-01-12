import { rest } from 'msw';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const combineURL = (baseURL: string, relativeURL: string) =>
  relativeURL
    ? `${baseURL.replace(/\/+$/, '')}/${relativeURL.replace(/^\/+/, '')}`
    : baseURL;

export type RequestMethod =
  | 'get'
  | 'post'
  | 'put'
  | 'patch'
  | 'delete'
  | 'options';

export type RequestParams = {
  delay?: number;
  fullPath?: boolean;
  method?: RequestMethod;
  path: string;
  queryParams?: URLSearchParams;
  statusCode?: number;
  response: any;
  once?: boolean;
};

const requestHelper = ({
  delay = 100,
  statusCode = 200,
  fullPath = false,
  method = 'get',
  path,
  queryParams,
  response,
  once,
}: RequestParams) => {
  const caller = rest[method];
  const URL = fullPath ? path : combineURL(API_BASE_URL ?? '', path);
  return caller(URL, (req, res, ctx) => {
    if (queryParams) {
      let gotParams = new URLSearchParams(req.url.searchParams);
      let wantParams = new URLSearchParams(queryParams);
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

    const args = [ctx.status(statusCode), ctx.delay(delay), ctx.json(response)];
    return once ? res.once(...args) : res(...args);
  });
};

export default requestHelper;
