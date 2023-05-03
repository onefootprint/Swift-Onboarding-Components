import {
  BootstrapData,
  CollectedKycDataOption,
  OnboardingConfig,
} from '@onefootprint/types';
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
    phoneNumber: '+103433423423',
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
      },
    });
    expect(state.context).toEqual({
      config: { ...testOnboardingConfig },
      bootstrapData: testBootstrapData,
    });
    expect(state.value).toEqual('idv');

    state = machine.send({
      type: 'idvCompleted',
      payload: {
        validationToken: 'token',
      },
    });
    expect(state.context).toEqual({
      validationToken: 'token',
      config: { ...testOnboardingConfig },
      bootstrapData: testBootstrapData,
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
      },
    });
    expect(state.context).toEqual({
      config: { ...testOnboardingConfig, isLive: false },
      bootstrapData: testBootstrapData,
    });
    expect(state.value).toEqual('idv');

    state = machine.send({
      type: 'idvCompleted',
      payload: {
        validationToken: 'token',
      },
    });

    expect(state.value).toEqual('idv');
    expect(state.context).toEqual({
      validationToken: 'token',
      config: { ...testOnboardingConfig, isLive: false },
      bootstrapData: testBootstrapData,
    });
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
