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
    sandboxSuffix,
  }: Partial<OnboardingMachineArgs>) => {
    const machine = interpret(
      createOnboardingMachine({
        userFound,
        bootstrapData,
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
        alreadyAuthorized: false,
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
      obConfigAuth: { [CLIENT_PUBLIC_KEY_HEADER]: 'token' },
      alreadyAuthorized: false,
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
      obConfigAuth: { [CLIENT_PUBLIC_KEY_HEADER]: 'token' },
      alreadyAuthorized: false,
    });
  });

  it('skips requirements when already authorized', () => {
    const machine = createMachine({});
    let { state } = machine;
    expect(state.value).toBe('init');

    state = machine.send({
      type: 'initContextUpdated',
      payload: {
        device: testDevice,
        config: testOnboardingConfig,
        alreadyAuthorized: true,
      },
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
      alreadyAuthorized: true,
      obConfigAuth: { [CLIENT_PUBLIC_KEY_HEADER]: 'token' },
    });
  });
});
