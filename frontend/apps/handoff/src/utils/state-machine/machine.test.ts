import {
  CollectedKycDataOption,
  D2PStatus,
  OnboardingConfig,
} from '@onefootprint/types';
import { interpret } from 'xstate';

import { createHandoffMachine } from './machine';
import { Events, States } from './types';

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
    mustCollectIdentityDocument: false,
    mustCollectSelfie: false,
    canAccessData: [CollectedKycDataOption.name],
    canAccessIdentityDocumentImages: false,
    canAccessSelfieImage: false,
  };

  it('stays in init until all required info is collected', () => {
    const machine = interpret(createMachine());
    machine.start();
    let { state } = machine;
    expect(state.value).toBe(States.init);

    state = machine.send({
      type: Events.initContextUpdated,
      payload: {
        authToken: 'token',
      },
    });
    expect(state.context.authToken).toEqual('token');
    expect(state.value).toBe(States.init);

    state = machine.send({
      type: Events.initContextUpdated,
      payload: {
        opener: 'mobile',
      },
    });
    expect(state.context.opener).toEqual('mobile');
    expect(state.value).toBe(States.init);

    state = machine.send({
      type: Events.initContextUpdated,
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
    expect(state.value).toBe(States.init);

    state = machine.send({
      type: Events.initContextUpdated,
      payload: {
        onboardingConfig: TestOnboardingConfig,
      },
    });
    expect(state.context.onboardingConfig).toEqual(TestOnboardingConfig);
    expect(state.value).toBe(States.init);

    state = machine.send({
      type: Events.initContextUpdated,
      payload: {
        requirements: {
          missingIdDoc: true,
        },
      },
    });
    expect(state.context.requirements).toEqual({
      missingIdDoc: true,
    });
    expect(state.value).toBe(States.idDoc);
  });

  it('checks for requirements after each step', () => {
    const machine = interpret(createMachine());
    machine.start();
    let { state } = machine;
    expect(state.value).toBe(States.init);

    state = machine.send({
      type: Events.initContextUpdated,
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
    expect(state.value).toBe(States.idDoc);

    state = machine.send({
      type: Events.requirementCompleted,
    });
    expect(state.value).toBe(States.checkRequirements);

    state = machine.send({
      type: Events.requirementsReceived,
      payload: {
        missingLiveness: true,
      },
    });
    expect(state.value).toBe(States.liveness);

    state = machine.send({
      type: Events.requirementCompleted,
    });
    expect(state.value).toBe(States.checkRequirements);

    state = machine.send({
      type: Events.requirementsReceived,
      payload: {},
    });
    expect(state.value).toBe(States.complete);
  });

  it('transitions to expired if received error payload', () => {
    const machine = interpret(createMachine());
    machine.start();
    let { state } = machine;
    expect(state.value).toBe(States.init);

    state = machine.send({
      type: Events.initContextUpdated,
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
    expect(state.value).toBe(States.idDoc);

    state = machine.send({
      type: Events.statusReceived,
      payload: {
        isError: true,
      },
    });
    expect(state.value).toBe(States.expired);
  });

  it('transitions to canceled if desktop canceled the d2p session', () => {
    const machine = interpret(createMachine());
    machine.start();
    let { state } = machine;
    expect(state.value).toBe(States.init);

    state = machine.send({
      type: Events.initContextUpdated,
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
    expect(state.value).toBe(States.liveness);

    state = machine.send({
      type: Events.statusReceived,
      payload: {
        status: D2PStatus.canceled,
      },
    });
    expect(state.value).toBe(States.canceled);
  });

  it('transitions to complete if another client has completed/failed the d2p session', () => {
    const machine = interpret(createMachine());
    machine.start();
    let { state } = machine;
    expect(state.value).toBe(States.init);

    state = machine.send({
      type: Events.initContextUpdated,
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
    expect(state.value).toBe(States.idDoc);

    state = machine.send({
      type: Events.statusReceived,
      payload: {
        status: D2PStatus.completed,
      },
    });
    expect(state.value).toBe(States.complete);
  });
});
