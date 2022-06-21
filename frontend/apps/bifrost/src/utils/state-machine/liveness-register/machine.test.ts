import { interpret } from 'xstate';

import createLivenessRegisterMachine from './machine';
import { Events, States } from './types';

describe('LivenessRegister Machine Tests', () => {
  describe('Correctly initializes & transitions out of init state', () => {
    it('When mobile has support for webauthn, context is correct', () => {
      const authToken = 'testAuthToken';
      const type = 'mobile';
      const machine = interpret(
        createLivenessRegisterMachine({
          device: {
            type,
            hasSupportForWebAuthn: true,
          },
          authToken,
        }),
      );
      machine.start();

      // Check that the initial context was set correctly from the args
      const { state } = machine;
      const { context } = state;
      expect(context.authToken).toEqual(authToken);
      expect(context.device.hasSupportForWebAuthn).toEqual(true);
      expect(context.device.type).toEqual(type);
      expect(state.value).toEqual(States.biometricRegister);
    });

    it('When mobile device lacks webauthn support, context is correct', () => {
      const authToken = 'testAuthToken';
      const type = 'mobile';
      const machine = interpret(
        createLivenessRegisterMachine({
          device: {
            type,
            hasSupportForWebAuthn: false,
          },
          authToken,
        }),
      );
      machine.start();

      // Check that the initial context was set correctly from the args
      const { state } = machine;
      const { context } = state;
      expect(context.authToken).toEqual(authToken);
      expect(context.device.hasSupportForWebAuthn).toEqual(false);
      expect(context.device.type).toEqual(type);
      expect(state.value).toEqual(States.livenessRegisterFailed);
    });

    it('When non-mobile device has webauthn support, context is correct', () => {
      const authToken = 'testAuthToken';
      const type = 'tablet';
      const machine = interpret(
        createLivenessRegisterMachine({
          device: {
            type,
            hasSupportForWebAuthn: true,
          },
          authToken,
        }),
      );
      machine.start();

      // Check that the initial context was set correctly from the args
      const { state } = machine;
      const { context } = state;
      expect(context.authToken).toEqual(authToken);
      expect(context.device.hasSupportForWebAuthn).toEqual(true);
      expect(context.device.type).toEqual(type);
      expect(state.value).toEqual(States.qrRegister);
    });

    it('When non-mobile device lacks webauthn support, context is correct', () => {
      const authToken = 'testAuthToken';
      const type = 'tablet';
      const machine = interpret(
        createLivenessRegisterMachine({
          device: {
            type,
            hasSupportForWebAuthn: false,
          },
          authToken,
        }),
      );
      machine.start();

      // Check that the initial context was set correctly from the args
      const { state } = machine;
      const { context } = state;
      expect(context.authToken).toEqual(authToken);
      expect(context.device.hasSupportForWebAuthn).toEqual(false);
      expect(context.device.type).toEqual(type);
      expect(state.value).toEqual(States.qrRegister);
    });
  });

  describe('Successfully completes biometric register', () => {
    it('Biometric register is successful', () => {
      const machine = createLivenessRegisterMachine({
        device: {
          type: 'mobile',
          hasSupportForWebAuthn: true,
        },
        authToken: 'testAuthToken',
      });

      // Succeeds at biometric register
      const state = machine.transition(States.biometricRegister, {
        type: Events.biometricRegisterSucceeded,
      });
      expect(state.value).toBe(States.livenessRegisterSucceeded);
    });
  });

  describe('Transitions from States.qrRegister', () => {
    const createMachine = () =>
      createLivenessRegisterMachine({
        device: {
          type: 'tablet',
          hasSupportForWebAuthn: false,
        },
        authToken: 'testAuthToken',
      });

    it('Assigns scoped auth token, this without a transition', () => {
      const machine = createMachine();
      const scopedAuthToken = 'scopedAuthToken';
      const state = machine.transition(States.qrRegister, {
        type: Events.scopedAuthTokenGenerated,
        payload: {
          scopedAuthToken,
        },
      });
      expect(state.context.scopedAuthToken).toEqual(scopedAuthToken);
      expect(state.value).toBe(States.qrRegister);
    });

    it('Sending the qr code via sms transitions to States.qrCodeSent', () => {
      const machine = createMachine();
      const state = machine.transition(States.qrRegister, {
        type: Events.qrCodeLinkSentViaSms,
      });
      expect(state.value).toEqual(States.qrCodeSent);
    });

    it('Scanning the qr code transitions to States.qrCodeScanned', () => {
      const machine = createMachine();
      //
      const state = machine.transition(States.qrRegister, {
        type: Events.qrCodeScanned,
      });
      expect(state.value).toEqual(States.qrCodeScanned);
    });

    it('Success in qr register transitions to States.livenessRegisterSucceeded', () => {
      const machine = createMachine();
      const state = machine.transition(States.qrRegister, {
        type: Events.qrRegisterSucceeded,
      });
      expect(state.value).toEqual(States.livenessRegisterSucceeded);
    });

    it('Failure in qr register transitions to States.livenessRegisterFailed', () => {
      const machine = createMachine();
      //
      const state = machine.transition(States.qrRegister, {
        type: Events.qrRegisterFailed,
      });
      expect(state.value).toEqual(States.livenessRegisterFailed);
    });

    it('Polling error should clear scoped auth token and not change state.', () => {
      const machine = createMachine();
      const state = machine.transition(States.qrRegister, {
        type: Events.statusPollingErrored,
      });
      expect(state.value).toEqual(States.qrRegister);
      expect(state.context.scopedAuthToken).toEqual(undefined);
    });

    it('Assigns scoped auth token, this does not cause a transition', () => {
      const machine = createMachine();
      const scopedAuthToken = 'scopedAuthToken';
      const state = machine.transition(States.qrRegister, {
        type: Events.scopedAuthTokenGenerated,
        payload: {
          scopedAuthToken,
        },
      });
      expect(state.context.scopedAuthToken).toEqual(scopedAuthToken);
    });
  });

  describe('Transitions from States.qrCodeScanned', () => {
    const createMachine = () =>
      createLivenessRegisterMachine({
        device: {
          type: 'tablet',
          hasSupportForWebAuthn: false,
        },
        authToken: 'testAuthToken',
      });

    it('Canceling QR code transitions to States.qrRegister', () => {
      const machine = createMachine();
      const state = machine.transition(States.qrCodeScanned, {
        type: Events.qrCodeCanceled,
      });
      expect(state.value).toEqual(States.qrRegister);
      expect(state.context.scopedAuthToken).toEqual(undefined);
    });

    it('Success transitions to States.livenessRegisterSucceeded', () => {
      const machine = createMachine();
      const state = machine.transition(States.qrCodeScanned, {
        type: Events.qrRegisterSucceeded,
      });
      expect(state.value).toEqual(States.livenessRegisterSucceeded);
    });

    it('Failure should transition to States.livenessRegisterFailed', () => {
      const machine = createMachine();
      const state = machine.transition(States.qrCodeScanned, {
        type: Events.qrRegisterFailed,
      });
      expect(state.value).toEqual(States.livenessRegisterFailed);
    });

    it('Status polling error should clear scoped auth token', () => {
      const machine = createMachine();
      const scopedAuthToken = 'scopedAuthToken';
      let state = machine.transition(States.qrRegister, {
        type: Events.scopedAuthTokenGenerated,
        payload: {
          scopedAuthToken,
        },
      });
      expect(state.context.scopedAuthToken).toEqual(scopedAuthToken);
      state = machine.transition(States.qrCodeScanned, {
        type: Events.statusPollingErrored,
      });
      expect(state.value).toEqual(States.qrRegister);
      expect(state.context.scopedAuthToken).toEqual(undefined);
    });
  });

  describe('Transitions from States.qrCodeSent', () => {
    const createMachine = () =>
      createLivenessRegisterMachine({
        device: {
          type: 'tablet',
          hasSupportForWebAuthn: false,
        },
        authToken: 'testAuthToken',
      });

    it('Assigns scoped auth token, this does not cause a transition', () => {
      const machine = createMachine();
      const scopedAuthToken = 'scopedAuthToken';
      const state = machine.transition(States.qrRegister, {
        type: Events.scopedAuthTokenGenerated,
        payload: {
          scopedAuthToken,
        },
      });
      expect(state.context.scopedAuthToken).toEqual(scopedAuthToken);
    });

    it('Canceling the qr code transition should transition to States.qrRegister and clear scoped auth token', () => {
      const machine = createMachine();
      const state = machine.transition(States.qrCodeSent, {
        type: Events.qrCodeCanceled,
      });
      expect(state.value).toEqual(States.qrRegister);
      expect(state.context.scopedAuthToken).toEqual(undefined);
    });

    it('Success should transition to States.livenessRegisterSucceeded', () => {
      const machine = createMachine();
      const state = machine.transition(States.qrCodeSent, {
        type: Events.qrRegisterSucceeded,
      });
      expect(state.value).toEqual(States.livenessRegisterSucceeded);
    });

    it('Failure should transition to States.livenessRegisterFailed', () => {
      const machine = createMachine();
      const state = machine.transition(States.qrCodeSent, {
        type: Events.qrRegisterFailed,
      });
      expect(state.value).toEqual(States.livenessRegisterFailed);
    });

    it('Status polling error should clear scoped auth token', () => {
      const machine = createMachine();
      const scopedAuthToken = 'scopedAuthToken';
      let state = machine.transition(States.qrRegister, {
        type: Events.scopedAuthTokenGenerated,
        payload: {
          scopedAuthToken,
        },
      });
      expect(state.context.scopedAuthToken).toEqual(scopedAuthToken);
      state = machine.transition(States.qrCodeSent, {
        type: Events.statusPollingErrored,
      });
      expect(state.value).toEqual(States.qrRegister);
      expect(state.context.scopedAuthToken).toEqual(undefined);
    });
  });
});
