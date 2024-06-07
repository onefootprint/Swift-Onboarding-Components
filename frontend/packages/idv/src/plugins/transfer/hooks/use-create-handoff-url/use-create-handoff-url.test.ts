import { customRenderHook } from '@onefootprint/test-utils';

import useCreateHandoffUrl from './use-create-handoff-url';
import {
  missingRequirementsFixture,
  missingRequirementsNonAvailableFixture,
  onboardingConfigFixture,
} from './use-create-handoff-url.test.config';

describe('useCreateHandoffUrl', () => {
  it('should return undefined when authToken is not provided', () => {
    const { result } = customRenderHook(() => useCreateHandoffUrl({}));
    expect(result.current).toBeUndefined();
  });

  describe('when app clip and instant app are not enabled', () => {
    it('should override the default baseUrl when a custom baseURL is defined', () => {
      const customBaseUrl = 'https://custom.base.url';
      const { result } = customRenderHook(() =>
        useCreateHandoffUrl({
          authToken: 'tok_mKgpGYfPAkkl3AaLrtsQsfNxK2xbWF88LN',
          baseUrl: customBaseUrl,
          onboardingConfig: onboardingConfigFixture,
          missingRequirements: missingRequirementsFixture,
        }),
      );

      expect(result.current.origin).toBe(customBaseUrl);
    });

    it('should return URL with authToken as hash and random seed', () => {
      const { result } = customRenderHook(() =>
        useCreateHandoffUrl({
          authToken: 'tok_mKgpGYfPAkkl3AaLrtsQsfNxK2xbWF88LN',
          baseUrl: 'https://handoff.onefootprint.com',
          onboardingConfig: onboardingConfigFixture,
          missingRequirements: missingRequirementsFixture,
        }),
      );

      expect(result.current.hash).toBe('#tok_mKgpGYfPAkkl3AaLrtsQsfNxK2xbWF88LN');
      expect(result.current.searchParams.get('r')).toMatch(/^\d{1,3}$/);
      expect(result.current.origin).toBe('https://handoff.onefootprint.com');
    });
  });

  describe('when appclip is enabled', () => {
    it('should return "appclip" in the URL', () => {
      const { result } = customRenderHook(() =>
        useCreateHandoffUrl({
          authToken: 'tok_mKgpGYfPAkkl3AaLrtsQsfNxK2xbWF88LN',
          onboardingConfig: {
            ...onboardingConfigFixture,
            isAppClipEnabled: true,
          },
          missingRequirements: missingRequirementsFixture,
        }),
      );

      expect(result.current.pathname).toBe('/appclip/app_exp_9KlTyouGLSNKMgJmpUdBAF');
    });
  });

  describe('when instant-app is enabled', () => {
    it('should return "instant-app" in the URL', () => {
      const { result } = customRenderHook(() =>
        useCreateHandoffUrl({
          authToken: 'tok_mKgpGYfPAkkl3AaLrtsQsfNxK2xbWF88LN',
          onboardingConfig: {
            ...onboardingConfigFixture,
            isInstantAppEnabled: true,
          },
          missingRequirements: missingRequirementsFixture,
        }),
      );

      expect(result.current.pathname).toBe('/instant-app');
    });
  });

  describe('when both instant app and appclip are enabled', () => {
    it('should return "appclip-instant" in the URL', () => {
      const { result } = customRenderHook(() =>
        useCreateHandoffUrl({
          authToken: 'tok_mKgpGYfPAkkl3AaLrtsQsfNxK2xbWF88LN',
          onboardingConfig: {
            ...onboardingConfigFixture,
            isAppClipEnabled: true,
            isInstantAppEnabled: true,
          },
          missingRequirements: missingRequirementsFixture,
        }),
      );

      expect(result.current.pathname).toBe('/appclip-instant/app_exp_9KlTyouGLSNKMgJmpUdBAF');
    });
  });

  describe('when the appclip does not have the required capabilities', () => {
    it('should not enable if missing requirements are not met', () => {
      const { result } = customRenderHook(() =>
        useCreateHandoffUrl({
          authToken: 'tok_mKgpGYfPAkkl3AaLrtsQsfNxK2xbWF88LN',
          onboardingConfig: {
            ...onboardingConfigFixture,
            isAppClipEnabled: true,
            isInstantAppEnabled: true,
          },
          missingRequirements: missingRequirementsNonAvailableFixture,
        }),
      );
      expect(result.current).toBeInstanceOf(URL);
      expect(result.current.pathname).toBe('/');
    });
  });
});
