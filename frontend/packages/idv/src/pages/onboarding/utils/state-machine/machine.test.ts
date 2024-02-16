import type { PublicOnboardingConfig } from '@onefootprint/types';
import { IdDI, OnboardingConfigStatus } from '@onefootprint/types';
import { interpret } from 'xstate';

import type { DeviceInfo } from '../../../../hooks/ui/use-device-info';
import type { OnboardingMachineArgs } from './machine';
import createOnboardingMachine from './machine';

describe('Onboarding Machine Tests', () => {
  const testOnboardingConfig: PublicOnboardingConfig = {
    isLive: true,
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
    key: 'key',
    isKyb: false,
    allowInternationalResidents: false,
  };

  const defaultBootstrapData = {
    [IdDI.email]: 'belce@onefootprint.com',
  };

  const testDevice: DeviceInfo = {
    type: 'mobile',
    hasSupportForWebauthn: true,
    osName: 'iOS',
    browser: 'Mobile Safari',
  };

  const createMachine = ({
    authToken = 'token',
    bootstrapData = defaultBootstrapData,
  }: Partial<OnboardingMachineArgs> = {}) => {
    const machine = interpret(
      createOnboardingMachine({
        bootstrapData,
        authToken,
        device: testDevice,
        config: testOnboardingConfig,
      }),
    );
    machine.start();
    return machine;
  };

  it('completes the onboarding flow from scratch', () => {
    const machine = createMachine();
    let { state } = machine;
    expect(state.value).toEqual('requirements');
    expect(state.context).toEqual({
      device: testDevice,
      config: testOnboardingConfig,
      authToken: 'token',
      bootstrapData: defaultBootstrapData,
      validationToken: undefined,
    });

    state = machine.send({
      type: 'requirementsCompleted',
    });
    expect(state.value).toEqual('validate');

    state = machine.send({
      type: 'validationComplete',
      payload: {
        validationToken: 'token',
      },
    });
    expect(state.value).toEqual('complete');

    expect(state.context).toEqual({
      device: testDevice,
      config: testOnboardingConfig,
      authToken: 'token',
      bootstrapData: defaultBootstrapData,
      validationToken: 'token',
    });
  });
});
