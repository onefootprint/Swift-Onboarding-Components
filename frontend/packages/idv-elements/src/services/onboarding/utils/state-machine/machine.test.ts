import { DeviceInfo } from '@onefootprint/hooks';
import {
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
    tenantPk = 'pk',
    data = { [IdDI.email]: 'belce@onefootprint.com' },
    sandboxSuffix,
  }: Partial<OnboardingMachineArgs>) => {
    const machine = interpret(
      createOnboardingMachine({
        userFound,
        tenantPk,
        data,
        authToken,
        sandboxSuffix,
      }),
    );
    machine.start();
    return machine;
  };

  it('completes the onboarding flow if received validation token', () => {
    const machine = createMachine({
      sandboxSuffix: 'sandboxTest',
    });
    let { state } = machine;
    expect(state.value).toBe('init');

    state = machine.send({
      type: 'initContextUpdated',
      payload: {
        device: testDevice,
        config: testOnboardingConfig,
        validationToken: 'token',
      },
    });
    expect(state.value).toEqual('authorize');
    expect(state.context).toEqual({
      validationToken: 'token',
      tenantPk: 'pk',
      userFound: true,
      device: testDevice,
      config: testOnboardingConfig,
      authToken: 'token',
      data: { [IdDI.email]: 'belce@onefootprint.com' },
      sandboxSuffix: 'sandboxTest',
    });

    state = machine.send({
      type: 'authorized',
      payload: {
        validationToken: 'token',
      },
    });
    expect(state.value).toEqual('complete');
    expect(state.context).toEqual({
      tenantPk: 'pk',
      userFound: true,
      device: testDevice,
      config: testOnboardingConfig,
      authToken: 'token',
      data: { [IdDI.email]: 'belce@onefootprint.com' },
      sandboxSuffix: 'sandboxTest',
      validationToken: 'token',
    });
  });

  it('completes the onboarding flow from scratch', () => {
    const machine = createMachine({});
    let { state } = machine;
    expect(state.value).toBe('init');

    state = machine.send({
      type: 'initContextUpdated',
      payload: {
        device: testDevice,
        config: testOnboardingConfig,
        validationToken: '',
      },
    });
    expect(state.value).toEqual('requirements');
    expect(state.context).toEqual({
      tenantPk: 'pk',
      userFound: true,
      device: testDevice,
      config: testOnboardingConfig,
      authToken: 'token',
      data: { [IdDI.email]: 'belce@onefootprint.com' },
      validationToken: '',
    });

    state = machine.send({
      type: 'requirementsCompleted',
    });
    expect(state.value).toEqual('authorize');
    expect(state.context).toEqual({
      tenantPk: 'pk',
      userFound: true,
      device: testDevice,
      config: testOnboardingConfig,
      authToken: 'token',
      data: { [IdDI.email]: 'belce@onefootprint.com' },
      validationToken: '',
    });

    state = machine.send({
      type: 'authorized',
      payload: {
        validationToken: 'token',
      },
    });
    expect(state.value).toEqual('complete');
    expect(state.context).toEqual({
      tenantPk: 'pk',
      userFound: true,
      device: testDevice,
      config: testOnboardingConfig,
      authToken: 'token',
      data: { [IdDI.email]: 'belce@onefootprint.com' },
      validationToken: 'token',
    });
  });
});
