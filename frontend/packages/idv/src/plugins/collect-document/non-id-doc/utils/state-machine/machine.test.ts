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
        },
      });
      expect(state.value).toEqual('processingMobile');
      state = machine.send({
        type: 'processingSucceeded',
      });
      expect(state.value).toEqual('complete');
      machine.stop();
    });

    it('Can complete the flow on mobile with capture', () => {
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
        type: 'startImageCapture',
      });
      expect(state.value).toEqual('imageCaptureMobile');
      state = machine.send({
        type: 'receivedDocument',
        payload: {
          imageFile: testFile,
          extraCompressed: false,
          captureKind: 'manual',
        },
      });
      expect(state.value).toEqual('processingMobile');
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
        },
      });
      expect(state.value).toEqual('processingDesktop');
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
        },
      });
      expect(state.value).toEqual('processingMobile');
      state = machine.send({
        type: 'processingErrored',
        payload: {
          errors: processingErrors,
        },
      });
      expect(state.value).toEqual('retryMobile');
      expect(state.context.errors).toEqual(processingErrors);
      state = machine.send({
        type: 'receivedDocument',
        payload: {
          imageFile: testFile,
          extraCompressed: false,
          captureKind: 'manual',
        },
      });
      expect(state.value).toEqual('processingMobile');
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
        },
      });
      expect(state.value).toEqual('processingDesktop');
      state = machine.send({
        type: 'processingErrored',
        payload: {
          errors: processingErrors,
        },
      });
      expect(state.value).toEqual('retryDesktop');
      expect(state.context.errors).toEqual(processingErrors);
      state = machine.send({
        type: 'receivedDocument',
        payload: {
          imageFile: testFile,
          extraCompressed: false,
          captureKind: 'manual',
        },
      });
      expect(state.value).toEqual('processingDesktop');
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
        },
      });
      expect(state.value).toEqual('processingDesktop');
      state = machine.send({
        type: 'processingErrored',
        payload: {
          errors: processingErrors,
        },
      });
      expect(state.value).toEqual('retryDesktop');
      expect(state.context.errors).toEqual(processingErrors);
      state = machine.send({
        type: 'uploadErrored',
        payload: {
          errors: uploadErrors,
        },
      });
      expect(state.value).toEqual('retryDesktop');
      expect(state.context.errors).toEqual(uploadErrors);
      state = machine.send({
        type: 'receivedDocument',
        payload: {
          imageFile: testFile,
          extraCompressed: false,
          captureKind: 'manual',
        },
      });
      expect(state.value).toEqual('processingDesktop');
      state = machine.send({
        type: 'processingSucceeded',
      });
      expect(state.value).toEqual('complete');
      machine.stop();
    });
  });

  describe('Navigation', () => {
    it('Can navigate back to document prompt from imageCaptureMobile and retryMobile', () => {
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
          },
        },
        {
          type: 'processingSucceeded',
        },
      ]);
      expect(state.value).toEqual('complete');
      machine.stop();
    });

    it('Can navigate back to document prompt from retryDesktop', () => {
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
        },
      });
      expect(state.value).toEqual('processingMobile');
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
        },
      });
      expect(state.value).toEqual('processingDesktop');
      state = machine.send({
        type: 'retryLimitExceeded',
      });
      expect(state.value).toEqual('failure');
      machine.stop();
    });
  });
});
