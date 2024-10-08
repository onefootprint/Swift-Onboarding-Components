import { setupServer } from 'msw/node';

import type { RequestParams } from './request-helper';
import requestHelper from './request-helper';

export const server = setupServer();

beforeAll(() => server.listen());

afterAll(() => server.close());

export const mockRequest = (requestParams: RequestParams) => server.use(requestHelper(requestParams));
