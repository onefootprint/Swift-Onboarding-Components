import { customRenderHook } from '@onefootprint/test-utils';
import {
  OnboardingConfigStatus,
  PublicOnboardingConfig,
} from '@onefootprint/types';

import useCreateHandoffUrl from './use-create-handoff-url';

const onboardingConfig: PublicOnboardingConfig = {
  allowInternationalResidents: false,
  appClipExperienceId: 'app_exp_9KlTyouGLSNKMgJmpUdBAF',
  isAppClipEnabled: false,
  isInstantAppEnabled: false,
  isLive: true,
  isNoPhoneFlow: false,
  key: 'key',
  logoUrl: 'url',
  name: 'tenant',
  orgName: 'tenantOrg',
  privacyPolicyUrl: 'url',
  status: OnboardingConfigStatus.enabled,
  requiresIdDoc: false,
  isKyb: false,
};

describe('useCreateHandoffUrl', () => {
  it('should return undefined when authToken is not provided', () => {
    const { result } = customRenderHook(() => useCreateHandoffUrl({}));
    expect(result.current).toBeUndefined();
  });

  describe('when a custom baseURL is defined', () => {
    it('should override the default baseUrl', () => {
      const customBaseUrl = 'https://custom.base.url';
      const { result } = customRenderHook(() =>
        useCreateHandoffUrl({
          authToken: 'tok_mKgpGYfPAkkl3AaLrtsQsfNxK2xbWF88LN',
          baseUrl: customBaseUrl,
          onboardingConfig,
        }),
      );

      const url = result.current;
      const parsedUrl = new URL(url as string);
      expect(parsedUrl.origin).toBe(customBaseUrl);
    });
  });

  describe('when appclip is not enabled', () => {
    it('should return URL with authToken as hash and random seed', () => {
      const { result } = customRenderHook(() =>
        useCreateHandoffUrl({
          authToken: 'tok_mKgpGYfPAkkl3AaLrtsQsfNxK2xbWF88LN',
          baseUrl: 'https://handoff.onefootprint.com',
          onboardingConfig,
        }),
      );

      const url = result.current;
      const parsedUrl = new URL(url as string);
      expect(parsedUrl.hash).toBe('#tok_mKgpGYfPAkkl3AaLrtsQsfNxK2xbWF88LN');
      expect(parsedUrl.searchParams.get('r')).toMatch(/^\d{1,3}$/);
      expect(parsedUrl.origin).toBe('https://handoff.onefootprint.com');
    });
  });

  describe('when appclip is enabled', () => {
    it('should return the URL with "appclip" and the advanced clip experience', () => {
      const { result } = customRenderHook(() =>
        useCreateHandoffUrl({
          authToken: 'tok_mKgpGYfPAkkl3AaLrtsQsfNxK2xbWF88LN',
          onboardingConfig: {
            ...onboardingConfig,
            isAppClipEnabled: true,
          },
        }),
      );

      const url = result.current;
      const parsedUrl = new URL(url as string);
      expect(parsedUrl.pathname).toBe(
        '/appclip/app_exp_9KlTyouGLSNKMgJmpUdBAF',
      );
    });
  });
});
