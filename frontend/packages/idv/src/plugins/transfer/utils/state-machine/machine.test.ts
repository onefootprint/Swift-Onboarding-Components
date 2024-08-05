import type { DocumentRequirement, RegisterPasskeyRequirement } from '@onefootprint/types';
import { DocumentRequestKind, DocumentUploadSettings, OnboardingRequirementKind } from '@onefootprint/types';
import { interpret } from 'xstate';

import createTransferMachine from './machine';
import type { MachineContext } from './types';

const livenessReq: RegisterPasskeyRequirement = {
  kind: OnboardingRequirementKind.registerPasskey,
  isMet: false,
};

export const idDocReq: DocumentRequirement = {
  kind: OnboardingRequirementKind.document,
  isMet: false,
  uploadSettings: DocumentUploadSettings.preferCapture,
  documentRequestId: 'id',
  config: {
    kind: DocumentRequestKind.Identity,
    shouldCollectConsent: true,
    shouldCollectSelfie: true,
    supportedCountryAndDocTypes: {},
  },
};

const getMobileArgs = () => ({
  authToken: 'tok_123',
  scopedAuthToken: '',
  device: {
    type: 'mobile',
    hasSupportForWebauthn: true,
    osName: 'iOS',
    browser: 'Mobile Safari',
  },
  missingRequirements: {
    liveness: livenessReq,
    documents: [idDocReq],
  },
  isInIframe: true,
});

const getDesktopArgs = (args: Partial<MachineContext>) => ({
  authToken: 'tok_123',
  scopedAuthToken: '',
  device: {
    type: 'desktop',
    hasSupportForWebauthn: true,
    osName: 'Windows',
    browser: 'Chrome',
  },
  missingRequirements: {
    liveness: livenessReq,
    documents: [idDocReq],
  },
  isInIframe: true,
  ...args,
});

describe('Transfer machine tests', () => {
  describe('when running on non-mobile device', () => {
    it('shows the qr transfer screen and requires confirm continue on desktop for id doc', () => {
      const machine = interpret(createTransferMachine(getDesktopArgs({})));
      machine.start();
      let state = machine.send([
        {
          type: 'scopedAuthTokenGenerated',
          payload: {
            scopedAuthToken: 'tok_456',
          },
        },
        {
          type: 'continueOnDesktop',
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

      state = machine.send({
        type: 'continueOnDesktop',
      });
      expect(state.value).toBe('confirmContinueOnDesktop');
      state = machine.send({
        type: 'continueOnDesktop',
      });
      expect(state.value).toBe('newTabRequest');
    });

    it('does not require confirm continue on desktop for id doc', () => {
      const machine = interpret(
        createTransferMachine(
          getDesktopArgs({
            missingRequirements: {
              liveness: livenessReq,
              documents: [],
            },
          }),
        ),
      );
      machine.start();
      const state = machine.send([
        {
          type: 'scopedAuthTokenGenerated',
          payload: {
            scopedAuthToken: 'tok_456',
          },
        },
        {
          type: 'continueOnDesktop',
        },
      ]);
      expect(state.context.scopedAuthToken).toBe('tok_456');
      expect(state.value).toBe('newTabRequest');
    });

    it('user can scan transition to qrProcessing', () => {
      const machine = interpret(createTransferMachine(getDesktopArgs({})));
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
      expect(state.value).toBe('qrProcessing');
      expect(state.context.scopedAuthToken).toBe('tok_456');

      state = machine.send([
        {
          type: 'd2pSessionCompleted',
        },
      ]);
      expect(state.value).toBe('complete');
    });

    it('handles cancellations and expirations correctly', () => {
      const machine = interpret(createTransferMachine(getDesktopArgs({})));
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

    it('continue on desktop does not open transfer for only id doc', () => {
      const machine = interpret(
        createTransferMachine(
          getDesktopArgs({
            missingRequirements: {
              liveness: undefined,
              documents: [idDocReq],
            },
          }),
        ),
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
          type: 'continueOnDesktop',
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
          type: 'continueOnDesktop',
        },
        {
          type: 'continueOnDesktop',
        },
      ]);
      expect(state.value).toBe('complete');
    });

    it('continue on desktop opens transfer for liveness when in iframe', () => {
      const machine = interpret(createTransferMachine(getDesktopArgs({})));
      machine.start();
      let state = machine.send([
        {
          type: 'scopedAuthTokenGenerated',
          payload: {
            scopedAuthToken: 'tok_456',
          },
        },
        {
          type: 'continueOnDesktop',
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
          type: 'continueOnDesktop',
        },
        {
          type: 'continueOnDesktop',
        },
      ]);
      expect(state.value).toBe('newTabRequest');
      state = machine.send([
        {
          type: 'newTabOpened',
          payload: {
            tab: {} as Window,
          },
        },
        {
          type: 'd2pSessionCompleted',
        },
      ]);
      expect(state.value).toBe('complete');
    });

    it('continue on desktop does not open transfer for liveness when not in iframe', () => {
      const machine = interpret(createTransferMachine(getDesktopArgs({ isInIframe: false })));
      machine.start();
      let state = machine.send([
        {
          type: 'scopedAuthTokenGenerated',
          payload: {
            scopedAuthToken: 'tok_456',
          },
        },
        {
          type: 'continueOnDesktop',
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
          type: 'continueOnDesktop',
        },
        {
          type: 'continueOnDesktop',
        },
      ]);
      expect(state.value).toBe('complete');
    });

    it('continue on desktop does not open transfer for liveness when device doesnt support webauthn', () => {
      const machine = interpret(
        createTransferMachine(
          getDesktopArgs({
            device: {
              type: 'desktop',
              hasSupportForWebauthn: false,
              osName: 'Windows',
              browser: 'Chrome',
            },
          }),
        ),
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
          type: 'continueOnDesktop',
        },
      ]);
      expect(state.value).toBe('confirmContinueOnDesktop');
      state = machine.send({
        type: 'continueOnDesktop',
      });
      expect(state.value).toBe('complete');
    });
  });

  describe('when there is only liveness requirement', () => {
    describe('when on social media browser', () => {
      it('completes immediately', () => {
        const machine = interpret(
          createTransferMachine({
            ...getMobileArgs(),
            missingRequirements: {
              liveness: livenessReq,
              documents: [],
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
      const machine = interpret(createTransferMachine(getMobileArgs()));
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
        createTransferMachine({
          ...getMobileArgs(),
          missingRequirements: {
            documents: [idDocReq],
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
          createTransferMachine({
            ...getMobileArgs(),
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
        const machine = interpret(createTransferMachine(getMobileArgs()));
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
        const machine = interpret(createTransferMachine(getMobileArgs()));
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
          createTransferMachine({
            ...getMobileArgs(),
            device: {
              type: 'mobile',
              hasSupportForWebauthn: false,
              osName: 'iOS',
              browser: 'Mobile Safari',
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
          createTransferMachine({
            ...getMobileArgs(),
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
          createTransferMachine({
            ...getMobileArgs(),
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
