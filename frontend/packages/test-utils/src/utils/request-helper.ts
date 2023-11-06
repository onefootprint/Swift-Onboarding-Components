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
  response,
  once,
}: RequestParams) => {
  const caller = rest[method];
  const URL = fullPath ? path : combineURL(API_BASE_URL ?? '', path);
  return caller(URL, (_req, res, ctx) => {
    const args = [ctx.status(statusCode), ctx.delay(delay), ctx.json(response)];
    return once ? res.once(...args) : res(...args);
  });
};

export default requestHelper;
