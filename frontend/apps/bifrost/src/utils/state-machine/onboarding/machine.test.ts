import { DeviceInfo } from '@onefootprint/hooks';
import {
  CollectedKycDataOption,
  OnboardingConfig,
  OnboardingStatus,
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
    device = testDevice,
    config = testOnboardingConfig,
    authToken = 'token',
    email = 'belce@onefootprint.com',
  }: Partial<OnboardingMachineArgs>) => {
    const machine = interpret(
      createOnboardingMachine({ userFound, device, config, authToken, email }),
    );
    machine.start();
    return machine;
  };

  it('completes the onboarding flow if received validation token', () => {
    const machine = createMachine({});
    let { state } = machine;
    expect(state.value).toBe('initOnboarding');

    state = machine.send({
      type: 'onboardingInitialized',
      payload: {
        validationToken: 'token',
      },
    });
    expect(state.value).toEqual('authorize');
    expect(state.context).toEqual({
      validationToken: 'token',
      userFound: true,
      device: testDevice,
      config: testOnboardingConfig,
      authToken: 'token',
      email: 'belce@onefootprint.com',
    });

    state = machine.send({
      type: 'authorized',
      payload: {
        validationToken: 'token',
        status: OnboardingStatus.failed,
      },
    });
    expect(state.value).toEqual('success');
    expect(state.context).toEqual({
      userFound: true,
      device: testDevice,
      config: testOnboardingConfig,
      authToken: 'token',
      email: 'belce@onefootprint.com',
      validationToken: 'token',
      status: OnboardingStatus.failed,
    });
  });

  it('completes the onboarding flow from scratch', () => {
    const machine = createMachine({});
    let { state } = machine;
    expect(state.value).toBe('initOnboarding');

    state = machine.send({
      type: 'onboardingInitialized',
      payload: {},
    });
    expect(state.value).toEqual('onboardingRequirements');
    expect(state.context).toEqual({
      userFound: true,
      device: testDevice,
      config: testOnboardingConfig,
      authToken: 'token',
      email: 'belce@onefootprint.com',
    });

    state = machine.send({
      type: 'onboardingRequirementsCompleted',
    });
    expect(state.value).toEqual('authorize');
    expect(state.context).toEqual({
      userFound: true,
      device: testDevice,
      config: testOnboardingConfig,
      authToken: 'token',
      email: 'belce@onefootprint.com',
    });

    state = machine.send({
      type: 'authorized',
      payload: {
        validationToken: 'token',
        status: OnboardingStatus.failed,
      },
    });
    expect(state.value).toEqual('success');
    expect(state.context).toEqual({
      userFound: true,
      device: testDevice,
      config: testOnboardingConfig,
      authToken: 'token',
      email: 'belce@onefootprint.com',
      validationToken: 'token',
      status: OnboardingStatus.failed,
    });
  });
});
