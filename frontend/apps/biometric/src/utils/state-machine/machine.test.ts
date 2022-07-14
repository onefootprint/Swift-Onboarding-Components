import { interpret } from 'xstate';

import d2pMobileMachine from './machine';
import { Events, States } from './types';

describe('D2PMobile Machine Tests', () => {
  describe('Correctly initializes the state machine', () => {
    it('Initial context is correct', () => {
      const machine = interpret(d2pMobileMachine);
      machine.start();

      // Check that the initial context was set correctly from the args
      const { state } = machine;
      const { context } = state;
      expect(state.value).toEqual(States.init);
      expect(context.authToken).toEqual('');
      expect(context.device.type).toEqual('mobile');
      expect(context.device.hasSupportForWebAuthn).toEqual(false);
    });
  });

  describe('Correctly assigns authToken following Events.authTokenReceived', () => {
    it('Auth token in States.init gets set correctly in context', () => {
      const authToken = 'testAuthToken';
      const state = d2pMobileMachine.transition(States.init, {
        type: Events.authTokenReceived,
        payload: {
          authToken,
        },
      });
      expect(state.value).toBe(States.init);
      expect(state.context.authToken).toEqual(authToken);
    });

    it('Auth token in States.expired gets set correctly in context', () => {
      const authToken = 'testAuthToken';
      const state = d2pMobileMachine.transition(States.expired, {
        type: Events.authTokenReceived,
        payload: {
          authToken,
        },
      });
      expect(state.value).toBe(States.register);
      expect(state.context.authToken).toEqual(authToken);
    });
  });

  describe('Correctly transitions out of init state', () => {
    it('Events.deviceInfoIdentified when mobile has webauthn support should set context correctly', () => {
      const type = 'mobile';
      const hasSupportForWebAuthn = true;
      const state = d2pMobileMachine.transition(States.init, {
        type: Events.deviceInfoIdentified,
        payload: {
          type,
          hasSupportForWebAuthn,
        },
      });
      expect(state.value).toBe(States.register);
      expect(state.context.device.type).toEqual(type);
      expect(state.context.device.hasSupportForWebAuthn).toEqual(
        hasSupportForWebAuthn,
      );
    });

    it('Events.deviceInfoIdentified when mobile lacks webauthn support should set context correctly', () => {
      const type = 'mobile';
      const hasSupportForWebAuthn = false;
      const state = d2pMobileMachine.transition(States.init, {
        type: Events.deviceInfoIdentified,
        payload: {
          type,
          hasSupportForWebAuthn,
        },
      });
      expect(state.value).toBe(States.unavailable);
      expect(state.context.device.type).toEqual(type);
      expect(state.context.device.hasSupportForWebAuthn).toEqual(
        hasSupportForWebAuthn,
      );
    });

    it('Events.deviceInfoIdentified when non-mobile lacks webauthn support should set context correctly', () => {
      const type = 'tablet';
      const hasSupportForWebAuthn = false;
      const state = d2pMobileMachine.transition(States.init, {
        type: Events.deviceInfoIdentified,
        payload: {
          type,
          hasSupportForWebAuthn,
        },
      });
      expect(state.value).toBe(States.unavailable);
      expect(state.context.device.type).toEqual(type);
      expect(state.context.device.hasSupportForWebAuthn).toEqual(
        hasSupportForWebAuthn,
      );
    });

    it('Events.deviceInfoIdentified when non-mobile has webauthn support should set context correctly', () => {
      const type = 'tablet';
      const hasSupportForWebAuthn = true;
      const state = d2pMobileMachine.transition(States.init, {
        type: Events.deviceInfoIdentified,
        payload: {
          type,
          hasSupportForWebAuthn,
        },
      });
      expect(state.value).toBe(States.unavailable);
      expect(state.context.device.type).toEqual(type);
      expect(state.context.device.hasSupportForWebAuthn).toEqual(
        hasSupportForWebAuthn,
      );
    });
  });

  describe('Transitions correctly from States.register', () => {
    it('Transitions to States.registerRetry', () => {
      const state = d2pMobileMachine.transition(States.register, {
        type: Events.registerFailed,
      });
      expect(state.value).toBe(States.registerRetry);
    });

    it('Transitions to States.success', () => {
      const state = d2pMobileMachine.transition(States.register, {
        type: Events.registerSucceeded,
      });
      expect(state.value).toBe(States.success);
    });

    it('Transitions to States.canceled', () => {
      const state = d2pMobileMachine.transition(States.register, {
        type: Events.canceled,
      });
      expect(state.value).toBe(States.canceled);
    });

    it('Transitions to States.expired', () => {
      const state = d2pMobileMachine.transition(States.register, {
        type: Events.statusPollingErrored,
      });
      expect(state.value).toBe(States.expired);
      expect(state.context.authToken).toEqual('');
    });
  });

  describe('Transitions correctly from States.registerRetry', () => {
    it('Transitions to States.success', () => {
      const state = d2pMobileMachine.transition(States.registerRetry, {
        type: Events.registerSucceeded,
      });
      expect(state.value).toBe(States.success);
    });

    it('Transitions to States.canceled', () => {
      const state = d2pMobileMachine.transition(States.registerRetry, {
        type: Events.canceled,
      });
      expect(state.value).toBe(States.canceled);
    });

    it('Transitions to States.expired', () => {
      const state = d2pMobileMachine.transition(States.registerRetry, {
        type: Events.statusPollingErrored,
      });
      expect(state.value).toBe(States.expired);
      expect(state.context.authToken).toEqual('');
    });
  });
});
