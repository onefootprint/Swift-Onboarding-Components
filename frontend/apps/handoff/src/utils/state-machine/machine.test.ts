import {
  CollectedKycDataOption,
  D2PStatus,
  OnboardingConfig,
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
    status: 'enabled',
    mustCollectData: [CollectedKycDataOption.name],
    canAccessData: [CollectedKycDataOption.name],
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
        device: {
          type: 'mobile',
          hasSupportForWebauthn: true,
        },
      },
    });
    expect(state.context.device).toEqual({
      type: 'mobile',
      hasSupportForWebauthn: true,
    });
    expect(state.value).toBe('init');

    state = machine.send({
      type: 'initContextUpdated',
      payload: {
        onboardingConfig: TestOnboardingConfig,
      },
    });
    expect(state.context.onboardingConfig).toEqual(TestOnboardingConfig);
    expect(state.value).toBe('init');

    state = machine.send({
      type: 'initContextUpdated',
      payload: {
        requirements: {
          missingIdDoc: true,
        },
      },
    });
    expect(state.context.requirements).toEqual({
      missingIdDoc: true,
    });
    expect(state.value).toBe('idDoc');
  });

  it('checks for requirements after each step', () => {
    const machine = interpret(createMachine());
    machine.start();
    let { state } = machine;
    expect(state.value).toBe('init');

    state = machine.send({
      type: 'initContextUpdated',
      payload: {
        authToken: 'token',
        opener: 'mobile',
        device: {
          type: 'mobile',
          hasSupportForWebauthn: true,
        },
        onboardingConfig: TestOnboardingConfig,
        requirements: {
          missingIdDoc: true,
        },
      },
    });
    expect(state.value).toBe('idDoc');

    state = machine.send({
      type: 'requirementCompleted',
    });
    expect(state.value).toBe('checkRequirements');

    state = machine.send({
      type: 'requirementsReceived',
      payload: {
        missingLiveness: true,
      },
    });
    expect(state.value).toBe('liveness');

    state = machine.send({
      type: 'requirementCompleted',
    });
    expect(state.value).toBe('checkRequirements');

    state = machine.send({
      type: 'requirementsReceived',
      payload: {},
    });
    expect(state.value).toBe('complete');
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
        device: {
          type: 'mobile',
          hasSupportForWebauthn: true,
        },
        onboardingConfig: TestOnboardingConfig,
        requirements: {
          missingIdDoc: true,
          missingConsent: true,
          missingSelfie: true,
        },
      },
    });
    expect(state.context.requirements?.missingIdDoc).toBe(true);
    expect(state.context.requirements?.missingConsent).toBe(true);
    expect(state.context.requirements?.missingSelfie).toBe(true);
    expect(state.value).toBe('idDoc');

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
        device: {
          type: 'mobile',
          hasSupportForWebauthn: true,
        },
        onboardingConfig: TestOnboardingConfig,
        requirements: {
          missingLiveness: true,
        },
      },
    });
    expect(state.context.requirements?.missingLiveness).toBe(true);
    expect(state.value).toBe('liveness');

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
        device: {
          type: 'mobile',
          hasSupportForWebauthn: true,
        },
        onboardingConfig: TestOnboardingConfig,
        requirements: {
          missingIdDoc: true,
        },
      },
    });
    expect(state.context.requirements?.missingIdDoc).toBe(true);
    expect(state.value).toBe('idDoc');

    state = machine.send({
      type: 'statusReceived',
      payload: {
        status: D2PStatus.completed,
      },
    });
    expect(state.value).toBe('complete');
  });
});
