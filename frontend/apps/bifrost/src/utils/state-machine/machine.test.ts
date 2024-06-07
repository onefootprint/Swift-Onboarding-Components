import type { IdvBootstrapData, PublicOnboardingConfig } from '@onefootprint/types';
import { IdDI, OnboardingConfigStatus } from '@onefootprint/types';
import { interpret } from 'xstate';

import { createBifrostMachine } from './machine';

describe('Bifrost Machine Tests', () => {
  const testOnboardingConfig: PublicOnboardingConfig = {
    isLive: true,
    key: 'key',
    logoUrl: 'url',
    privacyPolicyUrl: 'url',
    name: 'tenant',
    orgName: 'tenantOrg',
    orgId: 'orgId',
    status: OnboardingConfigStatus.enabled,
    isAppClipEnabled: false,
    isInstantAppEnabled: false,
    appClipExperienceId: 'app_exp_9KlTyouGLSNKMgJmpUdBAF',
    isNoPhoneFlow: false,
    requiresIdDoc: false,
    isKyb: false,
    allowInternationalResidents: false,
  };

  const testBootstrapData: IdvBootstrapData = {
    [IdDI.email]: 'belce@onefootprint.com',
    [IdDI.phoneNumber]: '+103433423423',
  };

  const createMachine = () => {
    const machine = interpret(createBifrostMachine());
    machine.start();
    return machine;
  };

  it('completes the bifrost flow', () => {
    const machine = createMachine();
    let { state } = machine;
    expect(state.value).toEqual('init');

    state = machine.send({
      type: 'initContextUpdated',
      payload: {
        config: { ...testOnboardingConfig },
        bootstrapData: { ...testBootstrapData },
        authToken: '',
        publicKey: '',
      },
    });
    expect(state.context).toEqual({
      config: { ...testOnboardingConfig },
      bootstrapData: testBootstrapData,
      authToken: '',
      publicKey: '',
      l10n: undefined,
      showCompletionPage: undefined,
      showLogo: undefined,
    });
    expect(state.value).toEqual('idv');
  });

  it('completes bifrost flow in sandbox mode', () => {
    const machine = createMachine();
    let { state } = machine;
    expect(state.value).toEqual('init');

    state = machine.send({
      type: 'initContextUpdated',
      payload: {
        config: { ...testOnboardingConfig, isLive: false },
        bootstrapData: { ...testBootstrapData },
        authToken: '',
        publicKey: '',
      },
    });
    expect(state.context).toEqual({
      config: { ...testOnboardingConfig, isLive: false },
      bootstrapData: testBootstrapData,
      authToken: '',
      publicKey: '',
      l10n: undefined,
      showCompletionPage: undefined,
      showLogo: undefined,
    });
    expect(state.value).toEqual('idv');
  });

  it('moves onto idv if config request fails', () => {
    const machine = createMachine();
    let { state } = machine;
    expect(state.value).toEqual('init');

    state = machine.send({
      type: 'configRequestFailed',
    });
    expect(state.value).toEqual('idv');
  });
});
