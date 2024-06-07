import { createUseRouterSpy, renderHook, waitFor } from '@onefootprint/test-utils';
import { CLIENT_PUBLIC_KEY_HEADER, HostedUrlType, KYB_BO_SESSION_AUTHORIZATION_HEADER } from '@onefootprint/types';

import type { UseParseUrlParamOptions } from './use-url-params';
import useParseUrl from './use-url-params';

describe('useUrlParams', () => {
  const useRouterSpy = createUseRouterSpy();
  const token = 'tok_123456';

  const renderUseParseUrl = (options: UseParseUrlParamOptions) => renderHook(() => useParseUrl(options));

  it('parses ob pk token correctly', async () => {
    useRouterSpy({
      query: { type: HostedUrlType.onboardingConfigPublicKey },
      asPath: `#${token}`,
    });
    const onSuccess = jest.fn();
    const onError = jest.fn();
    renderUseParseUrl({ onSuccess, onError });
    await waitFor(() => {
      expect(onError).not.toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({
        [CLIENT_PUBLIC_KEY_HEADER]: token,
      });
    });
  });

  it('parses user token correctly', async () => {
    useRouterSpy({
      query: { type: HostedUrlType.user },
      asPath: `#${token}`,
    });
    const onSuccess = jest.fn();
    const onError = jest.fn();
    renderUseParseUrl({ onSuccess, onError });
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(undefined, token);
    });
  });

  it('parses beneficial owner token correctly', async () => {
    useRouterSpy({
      query: { type: HostedUrlType.beneficialOwner },
      asPath: `#${token}`,
    });
    const onSuccess = jest.fn();
    const onError = jest.fn();
    renderUseParseUrl({ onSuccess, onError });
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({
        [KYB_BO_SESSION_AUTHORIZATION_HEADER]: token,
      });
    });
  });

  it('handles misformatted kinds correctly', async () => {
    useRouterSpy({
      query: { type: [HostedUrlType.beneficialOwner, HostedUrlType.user] },
      asPath: `#${token}`,
    });
    const onSuccess = jest.fn();
    const onError = jest.fn();
    renderUseParseUrl({ onSuccess, onError });
    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it('handles invalid kinds correctly', async () => {
    useRouterSpy({
      query: { type: 'hello' },
      asPath: `#${token}`,
    });
    const onSuccess = jest.fn();
    const onError = jest.fn();
    renderUseParseUrl({ onSuccess, onError });
    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it('handles missing kinds correctly', async () => {
    useRouterSpy({
      query: {},
      asPath: `#${token}`,
    });
    const onSuccess = jest.fn();
    const onError = jest.fn();
    renderUseParseUrl({ onSuccess, onError });
    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it('handles missing token correctly', async () => {
    useRouterSpy({
      query: {},
      asPath: '',
    });
    const onSuccess = jest.fn();
    const onError = jest.fn();
    renderUseParseUrl({ onSuccess, onError });
    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });
});
