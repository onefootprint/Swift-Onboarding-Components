import { interpret } from 'xstate';

import { createHandoffMachine } from './machine';
import { Events, States } from './types';

describe('Biometric Machine Tests', () => {
  describe('Correctly initializes the state machine', () => {
    it('Initial context is correct', () => {
      const machine = interpret(createHandoffMachine());
      machine.start();
      // Check that the initial context was set correctly from the args
      const { state } = machine;
      const { context } = state;
      expect(state.value).toEqual(States.init);
      expect(context.authToken).toEqual('');
      expect(context.device).toEqual(undefined);
      machine.stop();
    });
  });

  describe('When device info is identified first', () => {
    it('Waits for auth token', () => {
      const machine = interpret(createHandoffMachine());
      let { state } = machine.start();

      expect(state.value).toBe(States.init);
      expect(state.context.authToken).toEqual('');
      expect(state.context.device).toEqual(undefined);

      state = machine.send({
        type: Events.deviceInfoIdentified,
        payload: {
          type: 'mobile',
          hasSupportForWebauthn: true,
        },
      });

      expect(state.context.device?.type).toEqual('mobile');
      expect(state.context.device?.hasSupportForWebauthn).toEqual(true);
      expect(state.value).toBe(States.init);

      state = machine.send({
        type: Events.paramsReceived,
        payload: {
          authToken: 'authToken',
        },
      });
      expect(state.value).toBe(States.register);
      expect(state.context.authToken).toEqual('authToken');

      machine.stop();
    });

    it('mobile device has no webauthn support', () => {
      const machine = interpret(createHandoffMachine());
      let { state } = machine.start();
      expect(state.value).toBe(States.init);

      state = machine.send({
        type: Events.deviceInfoIdentified,
        payload: {
          type: 'mobile',
          hasSupportForWebauthn: false,
        },
      });
      expect(state.context.device?.type).toEqual('mobile');
      expect(state.context.device?.hasSupportForWebauthn).toEqual(false);
      expect(state.value).toBe(States.unavailable);

      machine.stop();
    });

    it('non-mobile device has webauthn supprt', () => {
      const machine = interpret(createHandoffMachine());
      let { state } = machine.start();
      expect(state.value).toBe(States.init);

      state = machine.send({
        type: Events.deviceInfoIdentified,
        payload: {
          type: 'tablet',
          hasSupportForWebauthn: true,
        },
      });
      expect(state.context.device?.type).toEqual('tablet');
      expect(state.context.device?.hasSupportForWebauthn).toEqual(true);
      expect(state.value).toBe(States.unavailable);

      machine.stop();
    });
  });

  describe('If auth token is identified first', () => {
    it('Waits for device info', () => {
      const machine = interpret(createHandoffMachine());
      let { state } = machine.start();

      state = machine.send({
        type: Events.paramsReceived,
        payload: {
          authToken: 'authToken',
        },
      });
      expect(state.context.device).toEqual(undefined);
      expect(state.context.authToken).toEqual('authToken');
      expect(state.value).toBe(States.init);

      state = machine.send({
        type: Events.deviceInfoIdentified,
        payload: {
          type: 'mobile',
          hasSupportForWebauthn: true,
        },
      });

      expect(state.value).toBe(States.register);
      expect(state.context.device?.type).toEqual('mobile');
      expect(state.context.device?.hasSupportForWebauthn).toEqual(true);

      machine.stop();
    });
  });

  describe('When registering', () => {
    it('Successful attempt', () => {
      const machine = interpret(createHandoffMachine());
      machine.start();

      let state = machine.send({
        type: Events.deviceInfoIdentified,
        payload: {
          type: 'mobile',
          hasSupportForWebauthn: true,
        },
      });

      state = machine.send({
        type: Events.paramsReceived,
        payload: {
          authToken: 'authToken',
        },
      });
      expect(state.value).toBe(States.register);

      state = machine.send({
        type: Events.registerSucceeded,
      });
      expect(state.value).toBe(States.success);
      machine.stop();
    });

    it('Successful after retry attempt', () => {
      const machine = interpret(createHandoffMachine());
      machine.start();

      let state = machine.send({
        type: Events.deviceInfoIdentified,
        payload: {
          type: 'mobile',
          hasSupportForWebauthn: true,
        },
      });

      state = machine.send({
        type: Events.paramsReceived,
        payload: {
          authToken: 'authToken',
        },
      });
      expect(state.value).toBe(States.register);

      // can have multiple retries
      state = machine.send({
        type: Events.registerFailed,
      });
      expect(state.value).toBe(States.registerRetry);

      state = machine.send({
        type: Events.registerFailed,
      });
      expect(state.value).toBe(States.registerRetry);

      state = machine.send({
        type: Events.registerSucceeded,
      });
      expect(state.value).toBe(States.success);
      machine.stop();
    });

    it('Cancelled attempt', () => {
      const machine = interpret(createHandoffMachine());
      machine.start();

      let state = machine.send({
        type: Events.deviceInfoIdentified,
        payload: {
          type: 'mobile',
          hasSupportForWebauthn: true,
        },
      });

      state = machine.send({
        type: Events.paramsReceived,
        payload: {
          authToken: 'authToken',
        },
      });
      expect(state.value).toBe(States.register);

      state = machine.send({
        type: Events.registerFailed,
      });
      expect(state.value).toBe(States.registerRetry);

      state = machine.send({
        type: Events.canceled,
      });
      expect(state.value).toBe(States.canceled);
      machine.stop();
    });

    it('Expired auth token', () => {
      const machine = interpret(createHandoffMachine());
      machine.start();

      let state = machine.send({
        type: Events.deviceInfoIdentified,
        payload: {
          type: 'mobile',
          hasSupportForWebauthn: true,
        },
      });

      state = machine.send({
        type: Events.paramsReceived,
        payload: {
          authToken: 'authToken',
        },
      });
      expect(state.value).toBe(States.register);

      state = machine.send({
        type: Events.statusPollingErrored,
      });
      expect(state.context.authToken).toEqual('');
      expect(state.value).toBe(States.expired);
      machine.stop();
    });
  });
});
