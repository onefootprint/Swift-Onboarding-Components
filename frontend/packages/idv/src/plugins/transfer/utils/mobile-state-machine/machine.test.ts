import type {
  IdDocRequirement,
  RegisterPasskeyRequirement,
} from '@onefootprint/types';
import { OnboardingRequirementKind } from '@onefootprint/types';
import { interpret } from 'xstate';

import createMobileMachine from './machine';

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
    type: 'mobile',
    hasSupportForWebauthn: true,
    osName: 'iOS',
  },
  missingRequirements: {
    liveness: getLivenessReq(),
    idDoc: getIdDocReq(),
  },
});

describe('Transfer machine tests', () => {
  describe('when running on non-mobile device', () => {
    it('completes immediately', () => {
      const machine = interpret(
        createMobileMachine({
          ...getRegularArgs(),
          device: {
            type: 'desktop',
            hasSupportForWebauthn: true,
            osName: 'Windows',
          },
        }),
      ).onTransition(state => {
        expect(state.value).toEqual('complete');
      });
      machine.start();
      machine.stop();
    });
  });

  describe('when there is only liveness requirement', () => {
    describe('when on social media browser', () => {
      it('completes immediately', () => {
        const machine = interpret(
          createMobileMachine({
            ...getRegularArgs(),
            missingRequirements: {
              liveness: getLivenessReq(),
            },
            isSocialMediaBrowser: true,
          }),
        ).onTransition(state => {
          expect(state.value).toEqual('complete');
        });
        machine.start();
        machine.stop();
      });
    });

    it('should new new tab', () => {
      const machine = interpret(createMobileMachine(getRegularArgs()));
      machine.start();
      let state = machine.send([
        {
          type: 'scopedAuthTokenGenerated',
          payload: {
            scopedAuthToken: 'tok_456',
          },
        },
      ]);
      expect(state.value).toBe('newTabRequest');
      expect(state.context.scopedAuthToken).toBe('tok_456');

      state = machine.send([
        {
          type: 'newTabOpened',
          payload: {
            tab: {} as Window,
          },
        },
      ]);
      expect(state.value).toBe('newTabProcessing');

      state = machine.send([
        {
          type: 'd2pSessionCompleted',
        },
      ]);
      expect(state.value).toBe('complete');
    });
  });

  describe('when there is only id doc requirement', () => {
    it('should complete quietly', () => {
      // In this case, the user can complete the id doc flow on their mobile
      // device, so we don't need to do anything

      const machine = interpret(
        createMobileMachine({
          ...getRegularArgs(),
          missingRequirements: {
            idDoc: getIdDocReq(),
          },
        }),
      ).onTransition(state => {
        expect(state.value).toEqual('complete');
      });
      machine.start();
      machine.stop();
    });

    describe('when on social media browser', () => {
      it('should send SMS', () => {
        const machine = interpret(
          createMobileMachine({
            ...getRegularArgs(),
            isSocialMediaBrowser: true,
          }),
        );
        machine.start();
        let state = machine.send([
          {
            type: 'scopedAuthTokenGenerated',
            payload: {
              scopedAuthToken: 'tok_456',
            },
          },
        ]);
        expect(state.value).toBe('sms');
        expect(state.context.scopedAuthToken).toBe('tok_456');

        state = machine.send([
          {
            type: 'd2pSessionStarted',
          },
        ]);
        expect(state.value).toBe('smsProcessing');

        state = machine.send([
          {
            type: 'd2pSessionCompleted',
          },
        ]);
        expect(state.value).toBe('complete');
      });
    });
  });

  describe('when there is both liveness and id doc requirement', () => {
    describe('when device supports webauthn', () => {
      it('should open new tab', () => {
        const machine = interpret(createMobileMachine(getRegularArgs()));
        machine.start();
        let state = machine.send([
          {
            type: 'scopedAuthTokenGenerated',
            payload: {
              scopedAuthToken: 'tok_456',
            },
          },
        ]);
        expect(state.value).toBe('newTabRequest');
        expect(state.context.scopedAuthToken).toBe('tok_456');

        state = machine.send([
          {
            type: 'newTabOpened',
            payload: {
              tab: {} as Window,
            },
          },
        ]);
        expect(state.value).toBe('newTabProcessing');

        state = machine.send([
          {
            type: 'd2pSessionCompleted',
          },
        ]);
        expect(state.value).toBe('complete');
      });

      it('handles session cancellation/expiration correctly', () => {
        const machine = interpret(createMobileMachine(getRegularArgs()));
        machine.start();
        let state = machine.send([
          {
            type: 'scopedAuthTokenGenerated',
            payload: {
              scopedAuthToken: 'tok_456',
            },
          },
          {
            type: 'newTabOpened',
            payload: {
              tab: {} as Window,
            },
          },
          {
            type: 'd2pSessionCanceled',
          },
        ]);
        expect(state.value).toBe('newTabRequest');
        expect(state.context.scopedAuthToken).toBe(undefined);

        state = machine.send([
          {
            type: 'newTabOpened',
            payload: {
              tab: {} as Window,
            },
          },
          {
            type: 'd2pSessionExpired',
          },
        ]);
        expect(state.value).toBe('newTabRequest');

        state = machine.send({
          type: 'scopedAuthTokenGenerated',
          payload: {
            scopedAuthToken: 'tok_789',
          },
        });
        expect(state.value).toBe('newTabRequest');
        expect(state.context.scopedAuthToken).toBe('tok_789');

        state = machine.send([
          {
            type: 'newTabOpened',
            payload: {
              tab: {} as Window,
            },
          },
          {
            type: 'd2pSessionFailed',
          },
        ]);
        expect(state.value).toBe('complete');
      });
    });

    describe('when device does not support webauthn', () => {
      it('should complete quietly', () => {
        const machine = interpret(
          createMobileMachine({
            ...getRegularArgs(),
            device: {
              type: 'mobile',
              hasSupportForWebauthn: false,
              osName: 'iOS',
            },
          }),
        ).onTransition(state => {
          expect(state.value).toEqual('complete');
        });
        machine.start();
        machine.stop();
      });
    });

    describe('when on social media browser', () => {
      it('should send SMS', () => {
        const machine = interpret(
          createMobileMachine({
            ...getRegularArgs(),
            isSocialMediaBrowser: true,
          }),
        );
        machine.start();
        let state = machine.send([
          {
            type: 'scopedAuthTokenGenerated',
            payload: {
              scopedAuthToken: 'tok_456',
            },
          },
        ]);
        expect(state.value).toBe('sms');
        expect(state.context.scopedAuthToken).toBe('tok_456');

        state = machine.send([
          {
            type: 'd2pSessionStarted',
          },
        ]);
        expect(state.value).toBe('smsProcessing');

        state = machine.send([
          {
            type: 'd2pSessionCompleted',
          },
        ]);
        expect(state.value).toBe('complete');
      });

      it('handles session cancellation/expiration correctly', () => {
        const machine = interpret(
          createMobileMachine({
            ...getRegularArgs(),
            isSocialMediaBrowser: true,
          }),
        );
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
        expect(state.value).toBe('sms');
        expect(state.context.scopedAuthToken).toBe(undefined);

        state = machine.send([
          {
            type: 'd2pSessionStarted',
          },
          {
            type: 'd2pSessionExpired',
          },
        ]);
        expect(state.value).toBe('sms');

        state = machine.send({
          type: 'scopedAuthTokenGenerated',
          payload: {
            scopedAuthToken: 'tok_789',
          },
        });
        expect(state.value).toBe('sms');
        expect(state.context.scopedAuthToken).toBe('tok_789');

        state = machine.send([
          {
            type: 'd2pSessionStarted',
          },
          {
            type: 'd2pSessionFailed',
          },
        ]);
        expect(state.value).toBe('complete');
      });
    });
  });
});
