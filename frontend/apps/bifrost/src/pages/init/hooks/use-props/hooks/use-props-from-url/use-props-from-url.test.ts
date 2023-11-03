import { createUseRouterSpy, renderHook } from '@onefootprint/test-utils';

import usePropsFromUrl from './use-props-from-url';

/** Our test setup does not support Typescript
 * type OnSuccess = Parameters<typeof usePropsFromUrl>[0];
 * type OnSuccessArgs = Parameters<OnSuccess>[0];
 */

const useRouterSpy = createUseRouterSpy();

describe('usePropsFromUrl', () => {
  it('should return no data when a invalid URL is provided 1/3', () => {
    useRouterSpy({
      isReady: true,
      pathname: '/path',
      asPath: '/path#FragmentIdentifierHash',
    });
    const onSuccess = jest.fn();

    const { result } = renderHook(() => usePropsFromUrl(onSuccess));
    expect(result.current).toBe(undefined);
    expect(onSuccess).toHaveBeenCalledWith({
      l10n: undefined,
      options: undefined,
      userData: undefined,
      authToken: undefined,
    });
  });

  it('should return no data when a invalid URL is provided 2/3', () => {
    useRouterSpy({
      isReady: true,
      pathname: '/path',
      asPath: '/path#ENCODED_USER_DATA__ENCODED_OPTIONS',
    });
    const onSuccess = jest.fn();
    const { result } = renderHook(() => usePropsFromUrl(onSuccess));

    expect(result.current).toBe(undefined);
    expect(onSuccess).toHaveBeenCalledWith({
      l10n: undefined,
      options: undefined,
      userData: undefined,
      authToken: undefined,
    });
  });

  it('should return no data when a invalid URL is provided 3/3', () => {
    useRouterSpy({
      isReady: true,
      pathname: '/path',
      asPath: '/path#ENCODED_USER_DATA__ENCODED_OPTIONS__ENCODED_L10N',
    });
    const onSuccess = jest.fn();
    const { result } = renderHook(() => usePropsFromUrl(onSuccess));

    expect(result.current).toBe(undefined);
    expect(onSuccess).toHaveBeenCalledWith({
      l10n: undefined,
      options: undefined,
      userData: undefined,
      authToken: undefined,
    });
  });

  it('should be able to decode a real url with userData and options 1/2', () => {
    useRouterSpy({
      isReady: true,
      pathname: '/path',
      asPath:
        'http://id.onefootprint.com?public_key=123&redirect_url=redirectUrl#%7B%22id.email%22%3A%22string%22%2C%22id.phone_number%22%3A%22string%22%2C%22id.first_name%22%3A%22string%22%2C%22id.last_name%22%3A%22string%22%2C%22id.dob%22%3A%22string%22%2C%22id.address_line1%22%3A%22string%22%2C%22id.address_line2%22%3A%22string%22%2C%22id.city%22%3A%22string%22%2C%22id.state%22%3A%22string%22%2C%22id.country%22%3A%22US%22%2C%22id.zip%22%3A%22string%22%2C%22id.ssn9%22%3A%22string%22%2C%22id.ssn4%22%3A%22string%22%2C%22id.nationality%22%3A%22US%22%7D__%7B%22showCompletionPage%22%3Atrue%2C%22showLogo%22%3Atrue%7D',
    });
    const onSuccess = jest.fn();
    const { result } = renderHook(() => usePropsFromUrl(onSuccess));
    expect(result.current).toBe(undefined);
    expect(onSuccess).toHaveBeenCalledWith({
      userData: {
        'id.address_line1': 'string',
        'id.address_line2': 'string',
        'id.city': 'string',
        'id.country': 'US',
        'id.dob': 'string',
        'id.email': 'string',
        'id.first_name': 'string',
        'id.last_name': 'string',
        'id.nationality': 'US',
        'id.phone_number': 'string',
        'id.ssn4': 'string',
        'id.ssn9': 'string',
        'id.state': 'string',
        'id.zip': 'string',
      },
      options: {
        showCompletionPage: true,
        showLogo: true,
      },
      l10n: undefined,
      authToken: undefined,
    });
  });

  it('should be able to decode a real url with userData and options 2/2', () => {
    useRouterSpy({
      isReady: true,
      pathname: '/path',
      asPath:
        'http://id.onefootprint.com/path?public_key=123&redirect_url=redirectUrl#%7B%22id.email%22%3A%22a%40b.com%22%2C%22id.phone_number%22%3A%225555550100%22%2C%22id.first_name%22%3A%22first%22%2C%22id.last_name%22%3A%22last%22%2C%22id.dob%22%3A%221988-01-01%22%2C%22id.address_line1%22%3A%22string%22%2C%22id.address_line2%22%3A%22string%22%2C%22id.city%22%3A%22sity%22%2C%22id.state%22%3A%22state%22%2C%22id.country%22%3A%22US%22%2C%22id.zip%22%3A%22string%22%2C%22id.ssn9%22%3A%22string%22%2C%22id.ssn4%22%3A%22string%22%2C%22id.nationality%22%3A%22US%22%7D__%7B%22showCompletionPage%22%3Atrue%2C%22showLogo%22%3Atrue%7D',
    });
    const onSuccess = jest.fn();
    const { result } = renderHook(() => usePropsFromUrl(onSuccess));
    expect(result.current).toBe(undefined);
    expect(onSuccess).toHaveBeenCalledWith({
      userData: {
        'id.email': 'a@b.com',
        'id.phone_number': '5555550100',
        'id.first_name': 'first',
        'id.last_name': 'last',
        'id.dob': '1988-01-01',
        'id.address_line1': 'string',
        'id.address_line2': 'string',
        'id.city': 'sity',
        'id.state': 'state',
        'id.country': 'US',
        'id.zip': 'string',
        'id.ssn9': 'string',
        'id.ssn4': 'string',
        'id.nationality': 'US',
      },
      options: {
        showCompletionPage: true,
        showLogo: true,
      },
      l10n: undefined,
      authToken: undefined,
    });
  });

  it('should be able to decode a real url with userData, options and l10n', () => {
    useRouterSpy({
      isReady: true,
      pathname: '/path',
      asPath:
        'http://id.onefootprint.com?public_key=123&redirect_url=redirectUrl#%7B%22id.email%22%3A%22a%40b.com%22%2C%22id.phone_number%22%3A%225555550100%22%2C%22id.first_name%22%3A%22first%22%2C%22id.last_name%22%3A%22last%22%2C%22id.dob%22%3A%221988-01-01%22%2C%22id.address_line1%22%3A%22string%22%2C%22id.address_line2%22%3A%22string%22%2C%22id.city%22%3A%22sity%22%2C%22id.state%22%3A%22state%22%2C%22id.country%22%3A%22US%22%2C%22id.zip%22%3A%22string%22%2C%22id.ssn9%22%3A%22string%22%2C%22id.ssn4%22%3A%22string%22%2C%22id.nationality%22%3A%22US%22%7D__%7B%22showCompletionPage%22%3Atrue%2C%22showLogo%22%3Atrue%7D__%7B%22locale%22%3A%22es-MX%22%7D',
    });
    const onSuccess = jest.fn();
    const { result } = renderHook(() => usePropsFromUrl(onSuccess));
    expect(result.current).toBe(undefined);
    expect(onSuccess).toHaveBeenCalledWith({
      userData: {
        'id.email': 'a@b.com',
        'id.phone_number': '5555550100',
        'id.first_name': 'first',
        'id.last_name': 'last',
        'id.dob': '1988-01-01',
        'id.address_line1': 'string',
        'id.address_line2': 'string',
        'id.city': 'sity',
        'id.state': 'state',
        'id.country': 'US',
        'id.zip': 'string',
        'id.ssn9': 'string',
        'id.ssn4': 'string',
        'id.nationality': 'US',
      },
      options: {
        showCompletionPage: true,
        showLogo: true,
      },
      l10n: { locale: 'es-MX' },
      authToken: undefined,
    });
  });
});
