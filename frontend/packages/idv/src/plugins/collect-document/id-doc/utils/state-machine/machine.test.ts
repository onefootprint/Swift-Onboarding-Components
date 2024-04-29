import { IdDocImageTypes, SupportedIdDocTypes } from '@onefootprint/types';
import { interpret } from 'xstate';

import createIdDocMachine from './machine';
import {
  getArgsRegularDesktop,
  getArgsRegularMobile,
  processingErrors,
  testFile,
  uploadErrors,
} from './machine.test.config';

describe('Id Doc Machine Tests', () => {
  describe('Auto transition to the correct state after initState', () => {
    it('Should transition to country and doc type select state for mobile', () => {
      const machine = interpret(
        createIdDocMachine(getArgsRegularMobile()),
      ).onTransition(state => {
        expect(state.value).toEqual('countryAndType');
      });
      machine.start();
      machine.stop();
    });
    it('Should transition to country and doc type select state for desktop', () => {
      const machine = interpret(
        createIdDocMachine(getArgsRegularDesktop()),
      ).onTransition(state => {
        expect(state.value).toEqual('countryAndType');
      });
      machine.start();
      machine.stop();
    });
  });

  describe('Transitions to the correct state after country and doc', () => {
    it('Should transition frontImageCaptureMobile state for mobile', () => {
      const machine = interpret(createIdDocMachine(getArgsRegularMobile()));
      machine.start();

      const state = machine.send([
        {
          type: 'receivedCountryAndType',
          payload: {
            type: SupportedIdDocTypes.driversLicense,
            country: 'US',
            id: 'id',
          },
        },
        {
          type: 'consentReceived',
        },
      ]);
      expect(state.value).toEqual('frontImageCaptureMobile');
    });
    it('Should transition to consentDesktop state for desktop', () => {
      const machine = interpret(createIdDocMachine(getArgsRegularDesktop()));
      machine.start();

      const state = machine.send({
        type: 'receivedCountryAndType',
        payload: {
          type: SupportedIdDocTypes.driversLicense,
          country: 'US',
          id: 'id',
        },
      });
      expect(state.value).toEqual('consentDesktop');
    });
  });

  describe('Full flow test with image upload and navigate back', () => {
    it('Can execute the the full mobile flow properly', () => {
      const machine = interpret(createIdDocMachine(getArgsRegularMobile()));
      machine.start();

      let state = machine.send([
        {
          type: 'receivedCountryAndType',
          payload: {
            type: SupportedIdDocTypes.driversLicense,
            country: 'US',
            id: 'id',
          },
        },
        {
          type: 'consentReceived',
        },
      ]);
      expect(state.value).toEqual('frontImageCaptureMobile');
      expect(state.context.idDoc.country).toEqual('US');

      expect(state.context.idDoc.type).toEqual(
        SupportedIdDocTypes.driversLicense,
      );
      state = machine.send({
        type: 'navigatedToPrev',
      });
      expect(state.value).toEqual('countryAndType');

      state = machine.send([
        {
          type: 'receivedCountryAndType',
          payload: {
            type: SupportedIdDocTypes.driversLicense,
            country: 'US',
            id: 'id',
          },
        },
        {
          type: 'receivedImage',
          payload: {
            imageFile: testFile,
            captureKind: 'manual',
          },
        },
      ]);
      expect(state.value).toEqual('processingMobile');
      expect(state.context.image).toEqual({
        imageFile: testFile,
        captureKind: 'manual',
      });

      state = machine.send({
        type: 'processingSucceeded',
        payload: {
          nextSideToCollect: 'back',
        },
      });
      expect(state.value).toEqual('backImageCaptureMobile');

      state = machine.send([
        {
          type: 'receivedImage',
          payload: {
            imageFile: testFile,
            captureKind: 'manual',
          },
        },
      ]);
      expect(state.value).toEqual('processingMobile');
      expect(state.context.image).toEqual({
        imageFile: testFile,
        captureKind: 'manual',
      });

      state = machine.send({
        type: 'processingSucceeded',
        payload: {
          nextSideToCollect: 'selfie',
        },
      });
      expect(state.value).toEqual('selfieImageMobile');

      state = machine.send([
        {
          type: 'receivedImage',
          payload: {
            imageFile: testFile,
            captureKind: 'manual',
          },
        },
      ]);
      expect(state.value).toEqual('processingMobile');
      expect(state.context.image).toEqual({
        imageFile: testFile,
        captureKind: 'manual',
      });

      state = machine.send({
        type: 'processingSucceeded',
        payload: {
          nextSideToCollect: undefined,
        },
      });
      expect(state.value).toEqual('complete');
    });

    it('Can execute the the full desktop flow properly', () => {
      const machine = interpret(createIdDocMachine(getArgsRegularDesktop()));
      machine.start();

      let state = machine.send({
        type: 'receivedCountryAndType',
        payload: {
          type: SupportedIdDocTypes.driversLicense,
          country: 'US',
          id: 'id',
        },
      });
      expect(state.value).toEqual('consentDesktop');
      expect(state.context.idDoc.country).toEqual('US');

      state = machine.send({
        type: 'navigatedToPrev',
      });
      expect(state.value).toEqual('countryAndType');
      expect(state.context.idDoc.type).toEqual(
        SupportedIdDocTypes.driversLicense,
      );

      machine.send({
        type: 'receivedCountryAndType',
        payload: {
          type: SupportedIdDocTypes.driversLicense,
          country: 'US',
          id: 'id',
        },
      });

      state = machine.send({
        type: 'consentReceived',
      });
      expect(state.value).toEqual('frontImageDesktop');

      state = machine.send([
        {
          type: 'receivedImage',
          payload: {
            imageFile: testFile,
            captureKind: 'manual',
          },
        },
      ]);
      expect(state.value).toEqual('processingDesktop');
      expect(state.context.image).toEqual({
        imageFile: testFile,
        captureKind: 'manual',
      });

      state = machine.send({
        type: 'processingSucceeded',
        payload: {
          nextSideToCollect: 'back',
        },
      });
      expect(state.value).toEqual('backImageDesktop');

      state = machine.send([
        {
          type: 'receivedImage',
          payload: {
            imageFile: testFile,
            captureKind: 'manual',
          },
        },
      ]);
      expect(state.value).toEqual('processingDesktop');
      expect(state.context.image).toEqual({
        imageFile: testFile,
        captureKind: 'manual',
      });

      state = machine.send({
        type: 'processingSucceeded',
        payload: {
          nextSideToCollect: 'selfie',
        },
      });
      expect(state.value).toEqual('selfieImageDesktop');

      state = machine.send([
        {
          type: 'receivedImage',
          payload: {
            imageFile: testFile,
            captureKind: 'manual',
          },
        },
      ]);
      expect(state.value).toEqual('processingDesktop');
      expect(state.context.image).toEqual({
        imageFile: testFile,
        captureKind: 'manual',
      });

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
    it('Can retry image upload when upload fails and update errors on desktop', () => {
      const machine = interpret(createIdDocMachine(getArgsRegularDesktop()));
      machine.start();

      let state = machine.send([
        {
          type: 'receivedCountryAndType',
          payload: {
            type: SupportedIdDocTypes.driversLicense,
            country: 'US',
            id: 'id',
          },
        },
        {
          type: 'consentReceived',
        },
        {
          type: 'uploadErrored',
          payload: {
            errors: uploadErrors,
          },
        },
      ]);
      expect(state.value).toEqual('frontImageRetryDesktop');
      expect(state.context.errors).toEqual(uploadErrors);

      state = machine.send([
        {
          type: 'receivedImage',
          payload: {
            imageFile: testFile,
            captureKind: 'manual',
          },
        },
        {
          type: 'processingSucceeded',
          payload: {
            nextSideToCollect: 'back',
          },
        },
      ]);
      expect(state.value).toEqual('backImageDesktop');
      expect(state.context.errors).toEqual([]);
    });

    it('Can retry image upload when processing fails and update errors on desktop', () => {
      const machine = interpret(createIdDocMachine(getArgsRegularDesktop()));
      machine.start();

      let state = machine.send([
        {
          type: 'receivedCountryAndType',
          payload: {
            type: SupportedIdDocTypes.driversLicense,
            country: 'US',
            id: 'id',
          },
        },
        {
          type: 'consentReceived',
        },
        {
          type: 'receivedImage',
          payload: {
            imageFile: testFile,
            captureKind: 'manual',
          },
        },
        {
          type: 'processingErrored',
          payload: {
            errors: processingErrors,
          },
        },
      ]);
      expect(state.value).toEqual('frontImageRetryDesktop');
      expect(state.context.errors).toEqual(processingErrors);

      state = machine.send([
        {
          type: 'receivedImage',
          payload: {
            imageFile: testFile,
            captureKind: 'manual',
          },
        },
        {
          type: 'processingSucceeded',
          payload: {
            nextSideToCollect: 'back',
          },
        },
      ]);
      expect(state.value).toEqual('backImageDesktop');
      expect(state.context.errors).toEqual([]);
    });

    it('Can retry image upload when processing fails and update errors on mobile', () => {
      const machine = interpret(createIdDocMachine(getArgsRegularMobile()));
      machine.start();

      let state = machine.send([
        {
          type: 'receivedCountryAndType',
          payload: {
            type: SupportedIdDocTypes.driversLicense,
            country: 'US',
            id: 'id',
          },
        },
        {
          type: 'consentReceived',
        },
        {
          type: 'receivedImage',
          payload: {
            imageFile: testFile,
            captureKind: 'manual',
          },
        },
        {
          type: 'processingErrored',
          payload: {
            errors: processingErrors,
          },
        },
      ]);
      expect(state.value).toEqual('frontImageRetryMobile');
      expect(state.context.errors).toEqual(processingErrors);

      state = machine.send([
        {
          type: 'receivedImage',
          payload: {
            imageFile: testFile,
            captureKind: 'manual',
          },
        },
        {
          type: 'processingSucceeded',
          payload: {
            nextSideToCollect: 'back',
          },
        },
      ]);
      expect(state.value).toEqual('backImageCaptureMobile');
      expect(state.context.errors).toEqual([]);
    });

    it('Can select a different doc type from retry state desktop and resets image side', () => {
      const machine = interpret(createIdDocMachine(getArgsRegularDesktop()));
      machine.start();

      let state = machine.send([
        {
          type: 'receivedCountryAndType',
          payload: {
            type: SupportedIdDocTypes.driversLicense,
            country: 'US',
            id: 'id',
          },
        },
        {
          type: 'consentReceived',
        },
        {
          type: 'receivedImage',
          payload: {
            imageFile: testFile,
            captureKind: 'manual',
          },
        },
        {
          type: 'processingSucceeded',
          payload: {
            nextSideToCollect: 'back',
          },
        },
        {
          type: 'receivedImage',
          payload: {
            imageFile: testFile,
            captureKind: 'manual',
          },
        },
        {
          type: 'processingErrored',
          payload: {
            errors: processingErrors,
          },
        },
      ]);
      expect(state.value).toEqual('backImageRetryDesktop');
      expect(state.context.errors).toEqual(processingErrors);

      state = machine.send([
        {
          type: 'navigatedToCountryDoc',
        },
      ]);
      expect(state.value).toEqual('countryAndType');
      expect(state.context.errors).toEqual([]);

      state = machine.send({
        type: 'receivedCountryAndType',
        payload: {
          type: SupportedIdDocTypes.driversLicense,
          country: 'US',
          id: 'id',
        },
      });
      expect(state.context.currSide).toEqual(IdDocImageTypes.front);
    });

    it('Can select a different doc type from retry state mobile', () => {
      const machine = interpret(createIdDocMachine(getArgsRegularMobile()));
      machine.start();

      let state = machine.send([
        {
          type: 'receivedCountryAndType',
          payload: {
            type: SupportedIdDocTypes.driversLicense,
            country: 'US',
            id: 'id',
          },
        },
        {
          type: 'consentReceived',
        },
        {
          type: 'receivedImage',
          payload: {
            imageFile: testFile,
            captureKind: 'manual',
          },
        },
        {
          type: 'processingErrored',
          payload: {
            errors: processingErrors,
          },
        },
      ]);
      expect(state.value).toEqual('frontImageRetryMobile');
      expect(state.context.errors).toEqual(processingErrors);

      state = machine.send([
        {
          type: 'navigatedToCountryDoc',
        },
      ]);
      expect(state.value).toEqual('countryAndType');
      expect(state.context.errors).toEqual([]);
      expect(state.context.currSide).toEqual(IdDocImageTypes.front);
    });

    it('Allows uploading any side/selfie based nextSideToCollect out of order on mobile', () => {
      const machine = interpret(createIdDocMachine(getArgsRegularMobile()));
      machine.start();

      const state = machine.send([
        {
          type: 'receivedCountryAndType',
          payload: {
            type: SupportedIdDocTypes.driversLicense,
            country: 'US',
            id: 'id',
          },
        },
        {
          type: 'consentReceived',
        },
        {
          type: 'receivedImage',
          payload: {
            imageFile: testFile,
            captureKind: 'manual',
          },
        },
        {
          type: 'processingSucceeded',
          payload: {
            nextSideToCollect: 'selfie',
          },
        },
      ]);
      expect(state.value).toEqual('selfieImageMobile');
    });

    it('Allows uploading any side/selfie based nextSideToCollect out of order on desktop', () => {
      const machine = interpret(createIdDocMachine(getArgsRegularDesktop()));
      machine.start();

      const state = machine.send([
        {
          type: 'receivedCountryAndType',
          payload: {
            type: SupportedIdDocTypes.driversLicense,
            country: 'US',
            id: 'id',
          },
        },
        {
          type: 'consentReceived',
        },
        {
          type: 'receivedImage',
          payload: {
            imageFile: testFile,
            captureKind: 'manual',
          },
        },
        {
          type: 'processingSucceeded',
          payload: {
            nextSideToCollect: 'selfie',
          },
        },
      ]);
      expect(state.value).toEqual('selfieImageDesktop');
    });

    it('Can terminate the flow after any side upload on mobile', () => {
      const machine = interpret(createIdDocMachine(getArgsRegularMobile()));
      machine.start();

      const state = machine.send([
        {
          type: 'receivedCountryAndType',
          payload: {
            type: SupportedIdDocTypes.driversLicense,
            country: 'US',
            id: 'id',
          },
        },
        {
          type: 'consentReceived',
        },
        {
          type: 'receivedImage',
          payload: {
            imageFile: testFile,
            captureKind: 'manual',
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

    it('Can terminate the flow after any side upload on desktop', () => {
      const machine = interpret(createIdDocMachine(getArgsRegularDesktop()));
      machine.start();

      const state = machine.send([
        {
          type: 'receivedCountryAndType',
          payload: {
            type: SupportedIdDocTypes.driversLicense,
            country: 'US',
            id: 'id',
          },
        },
        {
          type: 'consentReceived',
        },
        {
          type: 'receivedImage',
          payload: {
            imageFile: testFile,
            captureKind: 'manual',
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

    it('Goes back to country and doc selection if camera errored', () => {
      const machine = interpret(createIdDocMachine(getArgsRegularMobile()));
      machine.start();

      const state = machine.send([
        {
          type: 'receivedCountryAndType',
          payload: {
            type: SupportedIdDocTypes.driversLicense,
            country: 'US',
            id: 'id',
          },
        },
        {
          type: 'consentReceived',
        },
        {
          type: 'cameraErrored',
        },
      ]);
      expect(state.value).toEqual('countryAndType');
    });

    it('Stays on back image capture if camera errored', () => {
      const machine = interpret(createIdDocMachine(getArgsRegularMobile()));
      machine.start();

      const state = machine.send([
        {
          type: 'receivedCountryAndType',
          payload: {
            type: SupportedIdDocTypes.driversLicense,
            country: 'US',
            id: 'id',
          },
        },
        {
          type: 'consentReceived',
        },
        {
          type: 'receivedImage',
          payload: {
            imageFile: testFile,
            captureKind: 'manual',
          },
        },
        {
          type: 'processingSucceeded',
          payload: {
            nextSideToCollect: 'back',
          },
        },
        {
          type: 'cameraErrored',
        },
      ]);
      expect(state.value).toEqual('backImageCaptureMobile');
    });

    it('Stays on the selfie capture if camera errored', () => {
      const machine = interpret(createIdDocMachine(getArgsRegularMobile()));
      machine.start();

      const state = machine.send([
        {
          type: 'receivedCountryAndType',
          payload: {
            type: SupportedIdDocTypes.driversLicense,
            country: 'US',
            id: 'id',
          },
        },
        {
          type: 'consentReceived',
        },
        {
          type: 'receivedImage',
          payload: {
            imageFile: testFile,
            captureKind: 'manual',
          },
        },
        {
          type: 'processingSucceeded',
          payload: {
            nextSideToCollect: 'selfie',
          },
        },
        {
          type: 'cameraErrored',
        },
      ]);
      expect(state.value).toEqual('selfieImageMobile');
    });

    it('Does not start front image capture if consent was not provided', () => {
      const machine = interpret(
        createIdDocMachine({
          ...getArgsRegularMobile(),
        }),
      );
      machine.start();

      let state = machine.send([
        {
          type: 'receivedCountryAndType',
          payload: {
            type: SupportedIdDocTypes.driversLicense,
            country: 'US',
            id: 'id',
          },
        },
      ]);

      expect(state.value).toEqual('countryAndType');
      expect(state.context.shouldCollectConsent).toEqual(true);

      state = machine.send([
        {
          type: 'consentReceived',
        },
      ]);
      expect(state.value).toEqual('frontImageCaptureMobile');
    });

    it('Terminate the flow when retry limit exceeds on mobile', () => {
      const machine = interpret(createIdDocMachine(getArgsRegularMobile()));
      machine.start();

      const state = machine.send([
        {
          type: 'receivedCountryAndType',
          payload: {
            type: SupportedIdDocTypes.driversLicense,
            country: 'US',
            id: 'id',
          },
        },
        {
          type: 'consentReceived',
        },
        {
          type: 'receivedImage',
          payload: {
            imageFile: testFile,
            captureKind: 'manual',
          },
        },
        {
          type: 'retryLimitExceeded',
        },
      ]);
      expect(state.value).toEqual('failure');
    });

    it('Terminate the flow when retry limit exceeds on desktop', () => {
      const machine = interpret(createIdDocMachine(getArgsRegularDesktop()));
      machine.start();

      const state = machine.send([
        {
          type: 'receivedCountryAndType',
          payload: {
            type: SupportedIdDocTypes.driversLicense,
            country: 'US',
            id: 'id',
          },
        },
        {
          type: 'consentReceived',
        },
        {
          type: 'receivedImage',
          payload: {
            imageFile: testFile,
            captureKind: 'manual',
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
