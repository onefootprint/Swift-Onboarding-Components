import { rest } from 'msw';
import { setupServer } from 'msw/node';

const { API_BASE_URL } = process.env;

const combineURL = (baseURL: string, relativeURL: string) =>
  relativeURL
    ? `${baseURL.replace(/\/+$/, '')}/${relativeURL.replace(/^\/+/, '')}`
    : baseURL;

type RequestMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options';

type RequestParams = {
  delay?: number;
  fullPath?: boolean;
  method?: RequestMethod;
  path: string;
  statusCode?: number;
  response: unknown;
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

export const server = setupServer();

beforeAll(() => server.listen());

afterAll(() => server.close());

export const mockRequest = (requestParams: RequestParams) =>
  server.use(requestHelper(requestParams));
