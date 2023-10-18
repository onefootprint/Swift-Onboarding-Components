const router = require('next/router');

type RouterSpy = {
  route?: string;
  push?: jest.Mock<any, any>;
  replace?: (newRoute: {
    pathname: string;
    query: Record<string, any>;
  }) => void;
  pathname?: string;
  query?: Record<string, any>;
  asPath?: string;
  isReady?: boolean;
};

const createUseRouterSpy = () => {
  const useRouter = jest.spyOn(router, 'useRouter');

  return ({
    asPath,
    pathname,
    push = jest.fn(),
    query = {},
    replace = jest.fn(),
    route,
    isReady = true,
  }: RouterSpy) => {
    useRouter.mockImplementation(() => ({
      isReady,
      asPath,
      pathname,
      push,
      query,
      replace,
      route,
      events: {
        on: jest.fn(),
      },
    }));
  };
};

export default createUseRouterSpy;
