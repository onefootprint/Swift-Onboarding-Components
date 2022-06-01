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
};

const createUseRouterSpy = () => {
  const useRouter = jest.spyOn(router, 'useRouter');

  return ({
    asPath,
    pathname,
    push = jest.fn(),
    query,
    replace = jest.fn(),
    route,
  }: RouterSpy) => {
    useRouter.mockImplementation(() => ({
      asPath,
      pathname,
      push,
      query,
      replace,
      route,
    }));
  };
};

export default createUseRouterSpy;
