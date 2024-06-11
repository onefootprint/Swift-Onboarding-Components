import { describe, expect, it, jest, mock } from 'bun:test';
import { CLIENT_PUBLIC_KEY_HEADER, HostedUrlType, KYB_BO_SESSION_AUTHORIZATION_HEADER } from '@onefootprint/types';
import { renderHook, waitFor } from '@testing-library/react';

import type { UseParseUrlParamOptions } from './use-url-params';
import useParseUrl from './use-url-params';

describe('useUrlParams', () => {
  const token = 'tok_123456';
  mock.module('next/router', () => ({
    useRouter: () => ({
      asPath: `#${token}`,
      isReady: true,
      query: { type: HostedUrlType.onboardingConfigPublicKey },
    }),
  }));
  const renderUseParseUrl = (options: UseParseUrlParamOptions) => renderHook(() => useParseUrl(options));

  it('parses ob pk token correctly', async () => {
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
    mock.module('next/router', () => ({
      useRouter: () => ({
        asPath: `#${token}`,
        isReady: true,
        query: { type: HostedUrlType.user },
      }),
    }));
    const onSuccess = jest.fn();
    const onError = jest.fn();
    renderUseParseUrl({ onSuccess, onError });
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(undefined, token);
    });
  });

  it('parses beneficial owner token correctly', async () => {
    mock.module('next/router', () => ({
      useRouter: () => ({
        asPath: `#${token}`,
        isReady: true,
        query: { type: HostedUrlType.beneficialOwner },
      }),
    }));
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
    mock.module('next/router', () => ({
      useRouter: () => ({
        asPath: `#${token}`,
        isReady: true,
        query: { type: [HostedUrlType.beneficialOwner, HostedUrlType.user] },
      }),
    }));
    const onSuccess = jest.fn();
    const onError = jest.fn();
    renderUseParseUrl({ onSuccess, onError });
    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it('handles invalid kinds correctly', async () => {
    mock.module('next/router', () => ({
      useRouter: () => ({ asPath: `#${token}`, isReady: true, query: { type: 'hello' } }),
    }));
    const onSuccess = jest.fn();
    const onError = jest.fn();
    renderUseParseUrl({ onSuccess, onError });
    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it('handles missing kinds correctly', async () => {
    mock.module('next/router', () => ({
      useRouter: () => ({ asPath: `#${token}`, isReady: true, query: {} }),
    }));
    const onSuccess = jest.fn();
    const onError = jest.fn();
    renderUseParseUrl({ onSuccess, onError });
    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it('handles missing token correctly', async () => {
    mock.module('next/router', () => ({
      useRouter: () => ({ asPath: `#${token}`, isReady: true, query: {} }),
    }));
    const onSuccess = jest.fn();
    const onError = jest.fn();
    renderUseParseUrl({ onSuccess, onError });
    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });
});
