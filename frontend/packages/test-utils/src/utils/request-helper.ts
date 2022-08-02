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
  response: any;
  statusCode?: number;
};

const requestHelper = ({
  delay = 100,
  statusCode = 200,
  fullPath = false,
  method = 'get',
  path,
  response,
}: RequestParams) => {
  const caller = rest[method];
  const URL = fullPath ? path : combineURL(API_BASE_URL ?? '', path);
  return caller(URL, (_req, res, ctx) =>
    res(ctx.delay(delay), ctx.status(statusCode), ctx.json(response)),
  );
};

export default requestHelper;
