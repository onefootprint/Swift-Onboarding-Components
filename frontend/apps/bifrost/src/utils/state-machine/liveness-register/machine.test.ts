import { interpret } from 'xstate';

import createLivenessRegisterMachine from './machine';
import { Events, States } from './types';

describe('LivenessRegister Machine Tests', () => {
  describe('when is using a mobile device', () => {
    describe('when everything goes well', () => {
      it('should open a new tab, and once it succeeds, it should finish the flow', () => {
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
        let { state } = machine;
        expect(state.value).toEqual(States.newTabRequest);
        state = machine.send({
          type: Events.newTabOpened,
          payload: { tab: window },
        });
        expect(state.value).toEqual(States.newTabProcessing);
        state = machine.send({
          type: Events.newTabRegisterSucceeded,
        });
        expect(state.value).toEqual(States.livenessRegisterSucceeded);
      });
    });

    describe('when the user cancels the flow', () => {
      it('should open a new tab, and once its cancelled, it should return to the new tab request state', () => {
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
        let { state } = machine;
        expect(state.value).toEqual(States.newTabRequest);
        state = machine.send({
          type: Events.newTabOpened,
          payload: { tab: window },
        });
        expect(state.value).toEqual(States.newTabProcessing);
        state = machine.send({
          type: Events.newTabRegisterCanceled,
        });
        expect(state.value).toEqual(States.newTabRequest);
      });
    });

    describe('when the scoped token expires', () => {
      it('should open a new tab, and once the token expires, it should return to the new tab request state', () => {
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
        let { state } = machine;
        expect(state.value).toEqual(States.newTabRequest);
        state = machine.send({
          type: Events.newTabOpened,
          payload: { tab: window },
        });
        expect(state.value).toEqual(States.newTabProcessing);
        state = machine.send({
          type: Events.statusPollingErrored,
        });
        expect(state.value).toEqual(States.newTabRequest);
      });
    });

    describe('when something goes wrong', () => {
      it('should open a new tab, and once something goes wrong, it should finish the flow', () => {
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
        let { state } = machine;
        expect(state.value).toEqual(States.newTabRequest);
        state = machine.send({
          type: Events.newTabOpened,
          payload: { tab: window },
        });
        expect(state.value).toEqual(States.newTabProcessing);
        state = machine.send({
          type: Events.newTabRegisterFailed,
        });
        expect(state.value).toEqual(States.livenessRegisterFailed);
      });
    });

    describe('when the device does not support webauthn', () => {
      it('should finish the flow', () => {
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
    });
  });
});

// TODO: Make tests a bit more simple
// https://linear.app/footprint/issue/FP-412/make-tests-abit-simpler
describe('transitions from init state', () => {
  describe('transitions from qrRegister state', () => {
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

    it('Polling error should clear scoped auth token and not change state', () => {
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

  describe('transitions from qrCodeScanned state', () => {
    const createMachine = () =>
      createLivenessRegisterMachine({
        device: {
          type: 'tablet',
          hasSupportForWebAuthn: false,
        },
        authToken: 'testAuthToken',
      });

    it('Canceling QR code transitions to qrRegister state', () => {
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

  describe('transitions from qrCodeSent state', () => {
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
