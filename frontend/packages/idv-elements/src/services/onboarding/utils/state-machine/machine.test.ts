import { DeviceInfo } from '@onefootprint/hooks';
import {
  CLIENT_PUBLIC_KEY_HEADER,
  CollectedKycDataOption,
  IdDI,
  OnboardingConfig,
} from '@onefootprint/types';
import { interpret } from 'xstate';

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
    status: 'enabled',
    mustCollectData: [CollectedKycDataOption.name],
    canAccessData: [CollectedKycDataOption.name],
  };

  const testDevice: DeviceInfo = {
    type: 'mobile',
    hasSupportForWebauthn: true,
  };

  const createMachine = ({
    userFound = true,
    authToken = 'token',
    data = { [IdDI.email]: 'belce@onefootprint.com' },
    sandboxSuffix,
  }: Partial<OnboardingMachineArgs>) => {
    const machine = interpret(
      createOnboardingMachine({
        userFound,
        data,
        authToken,
        sandboxSuffix,
        obConfigAuth: { [CLIENT_PUBLIC_KEY_HEADER]: 'token' },
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
      data: { [IdDI.email]: 'belce@onefootprint.com' },
      validationToken: undefined,
      obConfigAuth: { [CLIENT_PUBLIC_KEY_HEADER]: 'token' },
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
      data: { [IdDI.email]: 'belce@onefootprint.com' },
      validationToken: 'token',
      obConfigAuth: { [CLIENT_PUBLIC_KEY_HEADER]: 'token' },
    });
  });
});
