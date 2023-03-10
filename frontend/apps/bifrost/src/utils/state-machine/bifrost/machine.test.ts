import { DeviceInfo } from '@onefootprint/hooks';
import {
  CollectedKycDataOption,
  OnboardingConfig,
  OnboardingStatus,
} from '@onefootprint/types';
import { BootstrapData } from 'src/hooks/use-bifrost-machine';
import { interpret } from 'xstate';

import { createBifrostMachine } from './machine';

describe('Bifrost Machine Tests', () => {
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

  const testBootstrapData: BootstrapData = {
    email: 'belce@onefootprint.com',
    phoneNumber: '+10i3423423',
  };

  const testDevice: DeviceInfo = {
    type: 'mobile',
    hasSupportForWebauthn: true,
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
        device: { ...testDevice },
        config: { ...testOnboardingConfig },
        bootstrapData: { ...testBootstrapData },
      },
    });
    expect(state.context).toEqual({
      device: testDevice,
      config: { ...testOnboardingConfig },
      bootstrapData: testBootstrapData,
    });
    expect(state.value).toEqual('identify');

    state = machine.send({
      type: 'identifyCompleted',
      payload: {
        authToken: 'token',
        userFound: true,
        email: 'belce@onefootprint.com',
      },
    });
    expect(state.context).toEqual({
      device: testDevice,
      config: { ...testOnboardingConfig },
      bootstrapData: testBootstrapData,
      authToken: 'token',
      userFound: true,
      email: 'belce@onefootprint.com',
    });
    expect(state.value).toEqual('onboarding');

    state = machine.send({
      type: 'onboardingCompleted',
      payload: {
        validationToken: 'token',
        status: OnboardingStatus.failed,
      },
    });
    expect(state.value).toEqual('complete');
    expect(state.context).toEqual({
      device: testDevice,
      config: { ...testOnboardingConfig },
      bootstrapData: testBootstrapData,
      authToken: 'token',
      userFound: true,
      email: 'belce@onefootprint.com',
      validationToken: 'token',
      status: OnboardingStatus.failed,
    });
  });

  it('completes bifrost flow in sandbox mode', () => {
    const machine = createMachine();
    let { state } = machine;
    expect(state.value).toEqual('init');

    state = machine.send({
      type: 'initContextUpdated',
      payload: {
        device: { ...testDevice },
        config: { ...testOnboardingConfig, isLive: false },
        bootstrapData: { ...testBootstrapData },
      },
    });
    expect(state.context).toEqual({
      device: testDevice,
      config: { ...testOnboardingConfig, isLive: false },
      bootstrapData: testBootstrapData,
    });
    expect(state.value).toEqual('sandboxOutcome');

    state = machine.send({
      type: 'sandboxOutcomeSubmitted',
      payload: {
        sandboxSuffix: 'suffix',
      },
    });
    expect(state.value).toEqual('identify');

    state = machine.send({
      type: 'identifyCompleted',
      payload: {
        authToken: 'token',
        userFound: true,
        email: 'belce@onefootprint.com',
      },
    });
    expect(state.context).toEqual({
      device: testDevice,
      config: { ...testOnboardingConfig, isLive: false },
      bootstrapData: testBootstrapData,
      authToken: 'token',
      userFound: true,
      email: 'belce@onefootprint.com',
      sandboxSuffix: 'suffix',
    });
    expect(state.value).toEqual('onboarding');

    state = machine.send({
      type: 'onboardingCompleted',
      payload: {
        validationToken: 'token',
        status: OnboardingStatus.failed,
      },
    });
    expect(state.value).toEqual('complete');
    expect(state.context).toEqual({
      device: testDevice,
      config: { ...testOnboardingConfig, isLive: false },
      bootstrapData: testBootstrapData,
      authToken: 'token',
      userFound: true,
      email: 'belce@onefootprint.com',
      validationToken: 'token',
      status: OnboardingStatus.failed,
      sandboxSuffix: 'suffix',
    });
  });

  it('finishes flow if config request fails', () => {
    const machine = createMachine();
    let { state } = machine;
    expect(state.value).toEqual('init');

    state = machine.send({
      type: 'configRequestFailed',
    });
    expect(state.value).toEqual('configInvalid');
  });
});
