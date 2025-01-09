import { interpret } from 'xstate';

import createIdDocMachine from './machine';
import {
  getArgsRegularDesktop,
  getArgsRegularMobile,
  processingErrors,
  testFile,
  uploadErrors,
} from './machine.test.config';

describe('Non Id Doc Machine Tests', () => {
  describe('Regular happy path', () => {
    it('Can complete the flow on mobile with upload', () => {
      const machine = interpret(createIdDocMachine(getArgsRegularMobile()));
      machine.start();
      expect(machine.state.value).toEqual('init');

      let state = machine.send({
        type: 'contextInitialized',
        payload: {
          id: 'id',
        },
      });
      expect(state.value).toEqual('documentPrompt');
      state = machine.send({
        type: 'receivedDocument',
        payload: {
          imageFile: testFile,
          extraCompressed: false,
          captureKind: 'manual',
          forcedUpload: false,
        },
      });
      expect(state.value).toEqual('mobileProcessing');
      state = machine.send({
        type: 'processingSucceeded',
      });
      expect(state.value).toEqual('complete');
      machine.stop();
    });

    it('Can complete the flow on mobile with capture', () => {
      const machine = interpret(createIdDocMachine(getArgsRegularMobile({ cameraPermissionState: 'granted' })));
      machine.start();
      expect(machine.state.value).toEqual('init');

      let state = machine.send({ type: 'contextInitialized', payload: { id: 'id' } });
      expect(state.value).toEqual('documentPrompt');

      state = machine.send({ type: 'startImageCapture' });
      expect(state.value).toEqual('mobileImageCapture');

      state = machine.send({
        type: 'receivedDocument',
        payload: {
          imageFile: testFile,
          extraCompressed: false,
          captureKind: 'manual',
          forcedUpload: false,
        },
      });
      expect(state.value).toEqual('mobileProcessing');
      state = machine.send({
        type: 'processingSucceeded',
      });
      expect(state.value).toEqual('complete');
      machine.stop();
    });

    it('Can complete the flow on desktop', () => {
      const machine = interpret(createIdDocMachine(getArgsRegularDesktop()));
      machine.start();
      expect(machine.state.value).toEqual('init');

      let state = machine.send({
        type: 'contextInitialized',
        payload: {
          id: 'id',
        },
      });
      expect(state.value).toEqual('documentPrompt');
      state = machine.send({
        type: 'receivedDocument',
        payload: {
          imageFile: testFile,
          extraCompressed: false,
          captureKind: 'manual',
          forcedUpload: false,
        },
      });
      expect(state.value).toEqual('desktopProcessing');
      state = machine.send({
        type: 'processingSucceeded',
      });
      expect(state.value).toEqual('complete');
      machine.stop();
    });
  });

  describe('Error handling', () => {
    it('Can handle processing errors on mobile', () => {
      const machine = interpret(createIdDocMachine(getArgsRegularMobile()));
      machine.start();
      expect(machine.state.value).toEqual('init');

      let state = machine.send({
        type: 'contextInitialized',
        payload: {
          id: 'id',
        },
      });
      expect(state.value).toEqual('documentPrompt');
      state = machine.send({
        type: 'receivedDocument',
        payload: {
          imageFile: testFile,
          extraCompressed: false,
          captureKind: 'manual',
          forcedUpload: false,
        },
      });
      expect(state.value).toEqual('mobileProcessing');
      state = machine.send({
        type: 'processingErrored',
        payload: {
          errors: processingErrors,
        },
      });
      expect(state.value).toEqual('mobileRetry');
      expect(state.context.errors).toEqual(processingErrors);
      state = machine.send({
        type: 'receivedDocument',
        payload: {
          imageFile: testFile,
          extraCompressed: false,
          captureKind: 'manual',
          forcedUpload: false,
        },
      });
      expect(state.value).toEqual('mobileProcessing');
      state = machine.send({
        type: 'processingSucceeded',
      });
      expect(state.value).toEqual('complete');
      machine.stop();
    });

    it('Can handle processing errors on desktop', () => {
      const machine = interpret(createIdDocMachine(getArgsRegularDesktop()));
      machine.start();
      expect(machine.state.value).toEqual('init');

      let state = machine.send({
        type: 'contextInitialized',
        payload: {
          id: 'id',
        },
      });
      expect(state.value).toEqual('documentPrompt');
      state = machine.send({
        type: 'receivedDocument',
        payload: {
          imageFile: testFile,
          extraCompressed: false,
          captureKind: 'manual',
          forcedUpload: false,
        },
      });
      expect(state.value).toEqual('desktopProcessing');
      state = machine.send({
        type: 'processingErrored',
        payload: {
          errors: processingErrors,
        },
      });
      expect(state.value).toEqual('desktopRetry');
      expect(state.context.errors).toEqual(processingErrors);
      state = machine.send({
        type: 'receivedDocument',
        payload: {
          imageFile: testFile,
          extraCompressed: false,
          captureKind: 'manual',
          forcedUpload: false,
        },
      });
      expect(state.value).toEqual('desktopProcessing');
      state = machine.send({
        type: 'processingSucceeded',
      });
      expect(state.value).toEqual('complete');
      machine.stop();
    });

    it('Can handle upload errors on desktop retry page', () => {
      const machine = interpret(createIdDocMachine(getArgsRegularDesktop()));
      machine.start();
      expect(machine.state.value).toEqual('init');

      let state = machine.send({
        type: 'contextInitialized',
        payload: {
          id: 'id',
        },
      });
      expect(state.value).toEqual('documentPrompt');
      state = machine.send({
        type: 'receivedDocument',
        payload: {
          imageFile: testFile,
          extraCompressed: false,
          captureKind: 'manual',
          forcedUpload: false,
        },
      });
      expect(state.value).toEqual('desktopProcessing');
      state = machine.send({
        type: 'processingErrored',
        payload: {
          errors: processingErrors,
        },
      });
      expect(state.value).toEqual('desktopRetry');
      expect(state.context.errors).toEqual(processingErrors);
      state = machine.send({
        type: 'uploadErrored',
        payload: {
          errors: uploadErrors,
        },
      });
      expect(state.value).toEqual('desktopRetry');
      expect(state.context.errors).toEqual(uploadErrors);
      state = machine.send({
        type: 'receivedDocument',
        payload: {
          imageFile: testFile,
          extraCompressed: false,
          captureKind: 'manual',
          forcedUpload: false,
        },
      });
      expect(state.value).toEqual('desktopProcessing');
      state = machine.send({
        type: 'processingSucceeded',
      });
      expect(state.value).toEqual('complete');
      machine.stop();
    });
  });

  describe('Navigation', () => {
    it('Can navigate back to document prompt from mobileImageCapture and mobileRetry', () => {
      const machine = interpret(createIdDocMachine(getArgsRegularMobile()));
      machine.start();
      expect(machine.state.value).toEqual('init');

      let state = machine.send([
        {
          type: 'contextInitialized',
          payload: {
            id: 'id',
          },
        },
        {
          type: 'startImageCapture',
        },
        {
          type: 'navigatedToPrev',
        },
      ]);
      expect(state.value).toEqual('documentPrompt');
      state = machine.send([
        {
          type: 'receivedDocument',
          payload: {
            imageFile: testFile,
            extraCompressed: false,
            captureKind: 'manual',
            forcedUpload: false,
          },
        },
        {
          type: 'processingErrored',
          payload: {
            errors: processingErrors,
          },
        },
        {
          type: 'navigatedToPrompt',
        },
      ]);
      expect(state.value).toEqual('documentPrompt');
      state = machine.send([
        {
          type: 'receivedDocument',
          payload: {
            imageFile: testFile,
            extraCompressed: false,
            captureKind: 'manual',
            forcedUpload: false,
          },
        },
        {
          type: 'processingSucceeded',
        },
      ]);
      expect(state.value).toEqual('complete');
      machine.stop();
    });

    it('Can navigate back to document prompt from desktopRetry', () => {
      const machine = interpret(createIdDocMachine(getArgsRegularDesktop()));
      machine.start();
      expect(machine.state.value).toEqual('init');

      let state = machine.send([
        {
          type: 'contextInitialized',
          payload: {
            id: 'id',
          },
        },
        {
          type: 'receivedDocument',
          payload: {
            imageFile: testFile,
            extraCompressed: false,
            captureKind: 'manual',
            forcedUpload: false,
          },
        },
        {
          type: 'processingErrored',
          payload: {
            errors: processingErrors,
          },
        },
        {
          type: 'navigatedToPrompt',
        },
      ]);
      expect(state.value).toEqual('documentPrompt');
      state = machine.send([
        {
          type: 'receivedDocument',
          payload: {
            imageFile: testFile,
            extraCompressed: false,
            captureKind: 'manual',
            forcedUpload: false,
          },
        },
        {
          type: 'processingSucceeded',
        },
      ]);
      expect(state.value).toEqual('complete');
      machine.stop();
    });
  });

  describe('Retry limit exceeded', () => {
    it('Can handle retry limit exceeded on mobile', () => {
      const machine = interpret(createIdDocMachine(getArgsRegularMobile()));
      machine.start();
      expect(machine.state.value).toEqual('init');

      let state = machine.send({
        type: 'contextInitialized',
        payload: {
          id: 'id',
        },
      });
      expect(state.value).toEqual('documentPrompt');
      state = machine.send({
        type: 'receivedDocument',
        payload: {
          imageFile: testFile,
          extraCompressed: false,
          captureKind: 'manual',
          forcedUpload: false,
        },
      });
      expect(state.value).toEqual('mobileProcessing');
      state = machine.send({
        type: 'retryLimitExceeded',
      });
      expect(state.value).toEqual('failure');
      machine.stop();
    });

    it('Can handle retry limit exceeded on desktop', () => {
      const machine = interpret(createIdDocMachine(getArgsRegularDesktop()));
      machine.start();
      expect(machine.state.value).toEqual('init');

      let state = machine.send({
        type: 'contextInitialized',
        payload: {
          id: 'id',
        },
      });
      expect(state.value).toEqual('documentPrompt');
      state = machine.send({
        type: 'receivedDocument',
        payload: {
          imageFile: testFile,
          extraCompressed: false,
          captureKind: 'manual',
          forcedUpload: false,
        },
      });
      expect(state.value).toEqual('desktopProcessing');
      state = machine.send({
        type: 'retryLimitExceeded',
      });
      expect(state.value).toEqual('failure');
      machine.stop();
    });
  });

  describe('Considering context.cameraPermissionState', () => {
    it('should ignore cameraPermissionState screens for desktop ...', () => {
      const machine = interpret(createIdDocMachine(getArgsRegularDesktop()));
      machine.start();

      expect(machine.getSnapshot().value).toEqual('init');

      let state = machine.send({ type: 'contextInitialized', payload: { id: 'id' } });
      expect(state.value).toEqual('documentPrompt');

      state = machine.send({
        type: 'receivedDocument',
        payload: { imageFile: testFile, extraCompressed: false, captureKind: 'manual', forcedUpload: false },
      });
      expect(state.value).toEqual('desktopProcessing');
    });

    it('should show cameraPermissionState screens for tablet', () => {
      const machine = interpret(
        createIdDocMachine(
          getArgsRegularMobile({
            device: {
              browser: 'Mobile Safari',
              hasSupportForWebauthn: true,
              osName: 'iOS',
              type: 'tablet',
            },
          }),
        ),
      );
      machine.start();

      expect(machine.getSnapshot().value).toEqual('init');

      let state = machine.send({ type: 'contextInitialized', payload: { id: 'id' } });
      expect(state.value).toEqual('documentPrompt');

      state = machine.send([{ type: 'startImageCapture' }]);
      expect(state.value).toEqual('mobileRequestCameraAccess');

      state = machine.send([{ type: 'cameraAccessDenied', payload: { status: 'denied' } }]);
      expect(state.value).toEqual('mobileCameraAccessDenied');

      state = machine.send([{ type: 'navigatedToPrev' }]);
      expect(state.value).toEqual('mobileRequestCameraAccess');

      state = machine.send([{ type: 'cameraAccessGranted', payload: { status: 'granted' } }]);
      expect(state.value).toEqual('mobileImageCapture');
    });
  });
});
