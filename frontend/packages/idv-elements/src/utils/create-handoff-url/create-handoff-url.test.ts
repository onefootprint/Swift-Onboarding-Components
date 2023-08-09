import { OnboardingConfig, OnboardingConfigStatus } from '@onefootprint/types';

import createHandoffUrl from './create-handoff-url';

const onboardingConfig: OnboardingConfig = {
  id: 'ob_config_id_18RIzpIPRAL3pYlnO4Cgeb',
  createdAt: 'date',
  isLive: true,
  key: 'key',
  logoUrl: 'url',
  privacyPolicyUrl: 'url',
  name: 'tenant',
  orgName: 'tenantOrg',
  status: OnboardingConfigStatus.enabled,
  mustCollectData: [],
  canAccessData: [],
  isAppClipEnabled: false,
  tenantId: 'org_Jr24ZzJj1RDg3DXv3V5HUIv',
};

describe('createHandoffUrl', () => {
  it('should return undefined when authToken is not provided', () => {
    const result = createHandoffUrl({});
    expect(result).toBeUndefined();
  });

  test('should return URL with authToken as hash and random seed', () => {
    const url = createHandoffUrl({
      authToken: 'tok_mKgpGYfPAkkl3AaLrtsQsfNxK2xbWF88LN',
      baseUrl: 'https://handoff.onefootprint.com',
      onboardingConfig,
    }) as string;
    const parsedUrl = new URL(url);
    expect(parsedUrl.hash).toBe('#tok_mKgpGYfPAkkl3AaLrtsQsfNxK2xbWF88LN');
    expect(parsedUrl.searchParams.get('r')).toMatch(/^\d{1,3}$/);
    expect(parsedUrl.searchParams.get('tenant_id')).toBe(
      onboardingConfig.tenantId,
    );
    expect(parsedUrl.origin).toBe('https://handoff.onefootprint.com');
  });

  test('should override the default baseUrl', () => {
    const customBaseUrl = 'https://custom.base.url';
    const url = createHandoffUrl({
      authToken: 'tok_mKgpGYfPAkkl3AaLrtsQsfNxK2xbWF88LN',
      baseUrl: customBaseUrl,
      onboardingConfig,
    }) as string;
    const parsedUrl = new URL(url);
    expect(parsedUrl.origin).toBe(customBaseUrl);
  });

  describe('when appclip is enabled', () => {
    test('should set pathname to "appclip"', () => {
      const url = createHandoffUrl({
        authToken: 'tok_mKgpGYfPAkkl3AaLrtsQsfNxK2xbWF88LN',
        onboardingConfig,
      }) as string;
      const parsedUrl = new URL(url);
      expect(parsedUrl.pathname).toBe('/appclip');
    });
  });
});
