import {
  CollectedKycDataOption,
  D2PStatus,
  OnboardingConfig,
  OnboardingConfigStatus,
} from '@onefootprint/types';
import { interpret } from 'xstate';

import { createHandoffMachine } from './machine';

describe('handoff state machine', () => {
  const createMachine = () => createHandoffMachine();

  const TestOnboardingConfig: OnboardingConfig = {
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
    tenantId: 'org_Jr24ZzJj1RDg3DXv3V5HUIv',
  };

  it('stays in init until all required info is collected', () => {
    const machine = interpret(createMachine());
    machine.start();
    let { state } = machine;
    expect(state.value).toBe('init');

    state = machine.send({
      type: 'initContextUpdated',
      payload: {
        authToken: 'token',
      },
    });
    expect(state.context.authToken).toEqual('token');
    expect(state.value).toBe('init');

    state = machine.send({
      type: 'initContextUpdated',
      payload: {
        opener: 'mobile',
      },
    });
    expect(state.context.opener).toEqual('mobile');
    expect(state.value).toBe('init');

    state = machine.send({
      type: 'initContextUpdated',
      payload: {
        onboardingConfig: TestOnboardingConfig,
      },
    });
    expect(state.context.onboardingConfig).toEqual(TestOnboardingConfig);
    expect(state.value).toBe('idv');
  });

  it('transitions to expired if received error payload', () => {
    const machine = interpret(createMachine());
    machine.start();
    let { state } = machine;
    expect(state.value).toBe('init');

    state = machine.send({
      type: 'initContextUpdated',
      payload: {
        authToken: 'token',
        opener: 'mobile',
        onboardingConfig: TestOnboardingConfig,
      },
    });
    expect(state.value).toBe('idv');

    state = machine.send({
      type: 'statusReceived',
      payload: {
        isError: true,
      },
    });
    expect(state.value).toBe('expired');
  });

  it('transitions to canceled if desktop canceled the d2p session', () => {
    const machine = interpret(createMachine());
    machine.start();
    let { state } = machine;
    expect(state.value).toBe('init');

    state = machine.send({
      type: 'initContextUpdated',
      payload: {
        authToken: 'token',
        opener: 'mobile',
        onboardingConfig: TestOnboardingConfig,
      },
    });
    expect(state.value).toBe('idv');

    state = machine.send({
      type: 'statusReceived',
      payload: {
        status: D2PStatus.canceled,
      },
    });
    expect(state.value).toBe('canceled');
  });

  it('transitions to complete if another client has completed/failed the d2p session', () => {
    const machine = interpret(createMachine());
    machine.start();
    let { state } = machine;
    expect(state.value).toBe('init');

    state = machine.send({
      type: 'initContextUpdated',
      payload: {
        authToken: 'token',
        opener: 'mobile',
        onboardingConfig: TestOnboardingConfig,
      },
    });
    expect(state.value).toBe('idv');

    state = machine.send({
      type: 'statusReceived',
      payload: {
        status: D2PStatus.completed,
      },
    });
    expect(state.value).toBe('complete');
  });
});
