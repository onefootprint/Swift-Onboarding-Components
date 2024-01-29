import type {
  IdDocRequirement,
  RegisterPasskeyRequirement,
} from '@onefootprint/types';
import { OnboardingRequirementKind } from '@onefootprint/types';
import { interpret } from 'xstate';

import createDesktopMachine from './machine';

const getLivenessReq = (): RegisterPasskeyRequirement => ({
  kind: OnboardingRequirementKind.registerPasskey,
  isMet: false,
});
const getIdDocReq = (): IdDocRequirement => ({
  kind: OnboardingRequirementKind.idDoc,
  isMet: false,
  shouldCollectSelfie: true,
  shouldCollectConsent: true,
  uploadMode: 'default',
  supportedCountryAndDocTypes: {},
});

const getRegularArgs = () => ({
  authToken: 'tok_123',
  scopedAuthToken: '',
  device: {
    type: 'desktop',
    hasSupportForWebauthn: false,
  },
  missingRequirements: {
    liveness: getLivenessReq(),
    idDoc: getIdDocReq(),
  },
});

describe('Transfer machine tests', () => {
  it('completes if on mobile', () => {
    const machine = interpret(
      createDesktopMachine({
        authToken: 'tok_123',
        scopedAuthToken: '',
        device: {
          type: 'mobile',
          hasSupportForWebauthn: true,
        },
        missingRequirements: {
          liveness: getLivenessReq(),
          idDoc: getIdDocReq(),
        },
      }),
    ).onTransition(state => {
      expect(state.value).toBe('complete');
    });
    machine.start();
    machine.stop();
  });

  it('user can continue on desktop', () => {
    const machine = interpret(createDesktopMachine(getRegularArgs()));
    machine.start();
    let state = machine.send([
      {
        type: 'scopedAuthTokenGenerated',
        payload: {
          scopedAuthToken: 'tok_456',
        },
      },
      {
        type: 'confirmationRequired',
      },
    ]);
    expect(state.value).toBe('confirmContinueOnDesktop');
    expect(state.context.scopedAuthToken).toBe('tok_456');

    state = machine.send([
      {
        type: 'continueOnMobile',
      },
    ]);
    expect(state.value).toBe('qrRegister');

    state = machine.send([
      {
        type: 'confirmationRequired',
      },
      {
        type: 'continueOnDesktop',
      },
    ]);
    expect(state.value).toBe('complete');
  });

  it('user can scan transition to processing', () => {
    const machine = interpret(createDesktopMachine(getRegularArgs()));
    machine.start();
    let state = machine.send([
      {
        type: 'scopedAuthTokenGenerated',
        payload: {
          scopedAuthToken: 'tok_456',
        },
      },
      {
        type: 'd2pSessionStarted',
      },
    ]);
    expect(state.value).toBe('processing');
    expect(state.context.scopedAuthToken).toBe('tok_456');

    state = machine.send([
      {
        type: 'd2pSessionCompleted',
      },
    ]);
    expect(state.value).toBe('complete');
  });

  it('handles cancellations and expirations correctly', () => {
    const machine = interpret(createDesktopMachine(getRegularArgs()));
    machine.start();
    let state = machine.send([
      {
        type: 'scopedAuthTokenGenerated',
        payload: {
          scopedAuthToken: 'tok_456',
        },
      },
      {
        type: 'd2pSessionStarted',
      },
      {
        type: 'd2pSessionCanceled',
      },
    ]);
    expect(state.value).toBe('qrRegister');
    expect(state.context.scopedAuthToken).toBe(undefined);

    state = machine.send({
      type: 'scopedAuthTokenGenerated',
      payload: {
        scopedAuthToken: 'tok_789',
      },
    });

    expect(state.value).toBe('qrRegister');
    expect(state.context.scopedAuthToken).toBe('tok_789');

    state = machine.send({
      type: 'd2pSessionExpired',
    });

    expect(state.value).toBe('qrRegister');
    expect(state.context.scopedAuthToken).toBe(undefined);

    state = machine.send({
      type: 'scopedAuthTokenGenerated',
      payload: {
        scopedAuthToken: 'tok_789',
      },
    });

    expect(state.value).toBe('qrRegister');
    expect(state.context.scopedAuthToken).toBe('tok_789');

    state = machine.send({
      type: 'd2pSessionFailed',
    });
    expect(state.value).toBe('complete');
  });
});
