import { mock } from 'bun:test';

// next/headers
export const nextHeaders = () => ({
  cookies: () => ({ get: (name: string) => ({ value: name }) }),
});

// next/navigation
/** @ts-ignore: mock does not have the correct type */
export const pushMock = mock();
/** @ts-ignore: mock does not have the correct type */
export const replaceMock = mock();
/** @ts-ignore: mock does not have the correct type */
const useRouterMock = mock(() => ({ push: pushMock, replace: replaceMock }));
/** @ts-ignore: mock does not have the correct type */
const useSearchParamsMock = mock(() => new URLSearchParams(''));
export const nextNavigation = () => ({
  usePathname: () => 'test/path',
  useRouter: useRouterMock,
  useSearchParams: useSearchParamsMock,
});
