import {
  CollectedKycDataOption,
  IdDI,
  OnboardingConfig,
  OnboardingConfigStatus,
} from '@onefootprint/types';
import { interpret } from 'xstate';

import { DeviceInfo } from '../../../../hooks/ui/use-device-info';
import createOnboardingMachine, { OnboardingMachineArgs } from './machine';

describe('Onboarding Machine Tests', () => {
  const testOnboardingConfig: OnboardingConfig = {
    createdAt: 'date',
    id: 'id',
    isLive: true,
    key: 'key',
    logoUrl: 'url',
    privacyPolicyUrl: 'url',
    name: 'tenant',
    orgName: 'tenantOrg',
    status: OnboardingConfigStatus.enabled,
    mustCollectData: [CollectedKycDataOption.name],
    canAccessData: [CollectedKycDataOption.name],
    isAppClipEnabled: false,
  };

  const defaultBootstrapData = {
    [IdDI.email]: 'belce@onefootprint.com',
  };

  const testDevice: DeviceInfo = {
    type: 'mobile',
    hasSupportForWebauthn: true,
  };

  const createMachine = ({
    userFound = true,
    authToken = 'token',
    bootstrapData = defaultBootstrapData,
  }: Partial<OnboardingMachineArgs>) => {
    const machine = interpret(
      createOnboardingMachine({
        userFound,
        bootstrapData,
        authToken,
      }),
    );
    machine.start();
    return machine;
  };

  it('completes the onboarding flow from scratch', () => {
    const machine = createMachine({});
    let { state } = machine;
    expect(state.value).toBe('init');

    state = machine.send({
      type: 'initContextUpdated',
      payload: {
        device: testDevice,
        config: testOnboardingConfig,
      },
    });
    expect(state.value).toEqual('requirements');
    expect(state.context).toEqual({
      userFound: true,
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
      userFound: true,
      device: testDevice,
      config: testOnboardingConfig,
      authToken: 'token',
      bootstrapData: defaultBootstrapData,
      validationToken: 'token',
    });
  });
});
