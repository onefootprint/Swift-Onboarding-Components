import { IdDocType } from '@onefootprint/types';
import { interpret } from 'xstate';

import createIdDocMachine from './machine';
import {
  argsNonMobile,
  argsRegular,
  argsUsOnlySingleDocType,
  processingErrors,
  requirement,
} from './machine.test.config';

describe('Id Doc Machine Tests', () => {
  describe('Auto transition to the correct state after initState', () => {
    it('If the device in not mobile, it should transition to incompatible device final state', () => {
      const machine = interpret(createIdDocMachine(argsNonMobile)).onTransition(
        state => {
          expect(state.value).toEqual('incompatibleDevice');
        },
      );
      machine.start();
      machine.stop();
    });

    it('If the doc requirement is US only with a only one accepted doc type, it should transition to front image state', () => {
      const machine = interpret(
        createIdDocMachine(argsUsOnlySingleDocType),
      ).onTransition(state => {
        expect(state.value).toEqual('frontImage');
      });
      machine.start();
      machine.stop();
    });

    it('Otherwise, in regular case, it should transition to country and doc type select state', () => {
      const machine = interpret(createIdDocMachine(argsRegular)).onTransition(
        state => {
          expect(state.value).toEqual('countryAndType');
        },
      );
      machine.start();
      machine.stop();
    });
  });

  describe('Full flow test with image upload and navigate back', () => {
    it('Can execute the the full flow properly', () => {
      const machine = interpret(createIdDocMachine({ ...argsRegular }));
      machine.start();

      let state = machine.send({
        type: 'receivedCountryAndType',
        payload: {
          type: IdDocType.driversLicense,
          country: 'US',
        },
      });
      expect(state.value).toEqual('frontImage');
      expect(state.context.idDoc.country).toEqual('US');

      expect(state.context.idDoc.type).toEqual('driver_license');
      state = machine.send({
        type: 'navigatedToPrev',
      });
      expect(state.value).toEqual('countryAndType');

      state = machine.send([
        {
          type: 'receivedCountryAndType',
          payload: {
            type: IdDocType.driversLicense,
            country: 'US',
          },
        },
        {
          type: 'startImageCapture',
        },
        {
          type: 'navigatedToPrev',
        },
        {
          type: 'receivedImage',
          payload: {
            image: 'image',
          },
        },
      ]);
      expect(state.value).toEqual('processing');
      expect(state.context.image).toEqual('image');

      state = machine.send({
        type: 'processingSucceeded',
        payload: {
          nextSideToCollect: 'back',
        },
      });
      expect(state.value).toEqual('backImage');

      state = machine.send([
        {
          type: 'startImageCapture',
        },
        {
          type: 'navigatedToPrev',
        },
        {
          type: 'receivedImage',
          payload: {
            image: 'image',
          },
        },
      ]);
      expect(state.value).toEqual('processing');
      expect(state.context.image).toEqual('image');

      state = machine.send({
        type: 'processingSucceeded',
        payload: {
          nextSideToCollect: 'selfie',
        },
      });
      expect(state.value).toEqual('selfiePrompt');

      state = machine.send({
        type: 'consentReceived',
      });
      expect(state.value).toEqual('selfiePrompt');
      expect(state.context.requirement.shouldCollectConsent).toEqual(false);

      state = machine.send({
        type: 'startImageCapture',
      });
      expect(state.value).toEqual('selfieImage');

      state = machine.send([
        {
          type: 'receivedImage',
          payload: {
            image: 'image',
          },
        },
      ]);
      expect(state.value).toEqual('processing');
      expect(state.context.image).toEqual('image');

      state = machine.send({
        type: 'processingSucceeded',
        payload: {
          nextSideToCollect: undefined,
        },
      });
      expect(state.value).toEqual('complete');
    });
  });

  describe('Additional tests', () => {
    it('Can take front image using inline camera and upload', () => {
      const machine = interpret(createIdDocMachine({ ...argsRegular }));
      machine.start();

      const state = machine.send([
        {
          type: 'receivedCountryAndType',
          payload: {
            type: IdDocType.driversLicense,
            country: 'US',
          },
        },
        {
          type: 'startImageCapture',
        },
        {
          type: 'receivedImage',
          payload: {
            image: 'image',
          },
        },
      ]);
      expect(state.value).toEqual('processing');
      expect(state.context.image).toEqual('image');
    });

    it('Can take back image using inline camera and upload', () => {
      const machine = interpret(createIdDocMachine({ ...argsRegular }));
      machine.start();

      const state = machine.send([
        {
          type: 'receivedCountryAndType',
          payload: {
            type: IdDocType.driversLicense,
            country: 'US',
          },
        },
        {
          type: 'startImageCapture',
        },
        {
          type: 'receivedImage',
          payload: {
            image: 'image',
          },
        },
        {
          type: 'processingSucceeded',
          payload: {
            nextSideToCollect: 'back',
          },
        },
        {
          type: 'startImageCapture',
        },
        {
          type: 'receivedImage',
          payload: {
            image: 'image',
          },
        },
      ]);
      expect(state.value).toEqual('processing');
      expect(state.context.image).toEqual('image');
    });

    it('Can retry image upload when processing fails and update errors', () => {
      const machine = interpret(createIdDocMachine({ ...argsRegular }));
      machine.start();

      let state = machine.send([
        {
          type: 'receivedCountryAndType',
          payload: {
            type: IdDocType.driversLicense,
            country: 'US',
          },
        },
        {
          type: 'receivedImage',
          payload: {
            image: 'image',
          },
        },
        {
          type: 'processingErrored',
          payload: {
            errors: processingErrors,
          },
        },
      ]);
      expect(state.value).toEqual('frontImageRetry');
      expect(state.context.errors).toEqual(processingErrors);

      state = machine.send([
        {
          type: 'receivedImage',
          payload: {
            image: 'image',
          },
        },
        {
          type: 'processingSucceeded',
          payload: {
            nextSideToCollect: 'back',
          },
        },
      ]);
      expect(state.value).toEqual('backImage');
      expect(state.context.errors).toEqual([]);
    });

    it('Allows uploading any side/selfie based nextSideToCollect out of order', () => {
      const machine = interpret(createIdDocMachine({ ...argsRegular }));
      machine.start();

      const state = machine.send([
        {
          type: 'receivedCountryAndType',
          payload: {
            type: IdDocType.driversLicense,
            country: 'US',
          },
        },
        {
          type: 'receivedImage',
          payload: {
            image: 'image',
          },
        },
        {
          type: 'processingSucceeded',
          payload: {
            nextSideToCollect: 'selfie',
          },
        },
      ]);
      expect(state.value).toEqual('selfiePrompt');
    });

    it('Can terminate the flow after any side upload', () => {
      const machine = interpret(createIdDocMachine({ ...argsRegular }));
      machine.start();

      const state = machine.send([
        {
          type: 'receivedCountryAndType',
          payload: {
            type: IdDocType.driversLicense,
            country: 'US',
          },
        },
        {
          type: 'receivedImage',
          payload: {
            image: 'image',
          },
        },
        {
          type: 'processingSucceeded',
          payload: {
            nextSideToCollect: undefined,
          },
        },
      ]);
      expect(state.value).toEqual('complete');
    });

    it('Goes back to front image if camera errored', () => {
      const machine = interpret(createIdDocMachine({ ...argsRegular }));
      machine.start();

      const state = machine.send([
        {
          type: 'receivedCountryAndType',
          payload: {
            type: IdDocType.driversLicense,
            country: 'US',
          },
        },
        {
          type: 'startImageCapture',
        },
        {
          type: 'cameraErrored',
        },
      ]);
      expect(state.value).toEqual('frontImage');
    });

    it('Goes back to back image if camera errored', () => {
      const machine = interpret(createIdDocMachine({ ...argsRegular }));
      machine.start();

      const state = machine.send([
        {
          type: 'receivedCountryAndType',
          payload: {
            type: IdDocType.driversLicense,
            country: 'US',
          },
        },
        {
          type: 'receivedImage',
          payload: {
            image: 'image',
          },
        },
        {
          type: 'processingSucceeded',
          payload: {
            nextSideToCollect: 'back',
          },
        },
        {
          type: 'consentReceived',
        },
        {
          type: 'startImageCapture',
        },
        {
          type: 'cameraErrored',
        },
      ]);
      expect(state.value).toEqual('backImage');
    });

    it('Goes back to selfie prompt if camera errored', () => {
      const machine = interpret(createIdDocMachine({ ...argsRegular }));
      machine.start();

      const state = machine.send([
        {
          type: 'receivedCountryAndType',
          payload: {
            type: IdDocType.driversLicense,
            country: 'US',
          },
        },
        {
          type: 'receivedImage',
          payload: {
            image: 'image',
          },
        },
        {
          type: 'processingSucceeded',
          payload: {
            nextSideToCollect: 'selfie',
          },
        },
        {
          type: 'consentReceived',
        },
        {
          type: 'startImageCapture',
        },
        {
          type: 'cameraErrored',
        },
      ]);
      expect(state.value).toEqual('selfiePrompt');
    });

    it('Does not start selfie capture if consent was not provided', () => {
      const machine = interpret(
        createIdDocMachine({
          ...argsRegular,
          requirement: { ...requirement, shouldCollectConsent: true },
        }),
      );
      machine.start();

      const state = machine.send([
        {
          type: 'receivedCountryAndType',
          payload: {
            type: IdDocType.driversLicense,
            country: 'US',
          },
        },
        {
          type: 'receivedImage',
          payload: {
            image: 'image',
          },
        },
        {
          type: 'processingSucceeded',
          payload: {
            nextSideToCollect: 'selfie',
          },
        },
        {
          type: 'startImageCapture',
        },
      ]);
      expect(state.value).toEqual('selfiePrompt');
    });

    it('Terminate the flow when retry limit exceeds', () => {
      const machine = interpret(createIdDocMachine({ ...argsRegular }));
      machine.start();

      const state = machine.send([
        {
          type: 'receivedCountryAndType',
          payload: {
            type: IdDocType.driversLicense,
            country: 'US',
          },
        },
        {
          type: 'receivedImage',
          payload: {
            image: 'image',
          },
        },
        {
          type: 'retryLimitExceeded',
        },
      ]);
      expect(state.value).toEqual('failure');
    });
  });
});
