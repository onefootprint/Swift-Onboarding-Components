import { IdDocBadImageError, IdDocType } from '@onefootprint/types';
import { interpret } from 'xstate';

import createIdDocMachine from './machine';
import { Events, States } from './types';

describe('Id Doc Machine Tests', () => {
  const createMachine = () => createIdDocMachine();
  it('collects id doc only', () => {
    const machine = interpret(createMachine());
    machine.start();
    let { state } = machine;
    expect(state.value).toBe(States.init);
    expect(state.context).toEqual({
      idDoc: {},
      selfie: {},
    });

    state = machine.send({
      type: Events.receivedContext,
      payload: {
        authToken: 'token',
        device: {
          type: 'mobile',
          hasSupportForWebauthn: true,
        },
        requestId: 'request',
        idDocRequired: true,
        selfieRequired: false,
      },
    });
    expect(state.context).toEqual({
      authToken: 'token',
      device: {
        type: 'mobile',
        hasSupportForWebauthn: true,
      },
      requestId: 'request',
      idDoc: {
        required: true,
      },
      selfie: {
        required: false,
      },
    });
    expect(state.value).toEqual(States.idDocCountryAndType);

    state = machine.send({
      type: Events.idDocCountryAndTypeSelected,
      payload: {
        type: IdDocType.idCard,
        country: 'USA',
      },
    });
    expect(state.context.idDoc).toEqual({
      type: IdDocType.idCard,
      required: true,
      country: 'USA',
    });
    expect(state.value).toEqual(States.idDocFrontImage);

    state = machine.send({
      type: Events.receivedIdDocFrontImage,
      payload: {
        image: 'front',
      },
    });
    expect(state.context.idDoc.frontImage).toEqual('front');
    expect(state.value).toEqual(States.idDocBackImage);

    state = machine.send({
      type: Events.receivedIdDocBackImage,
      payload: {
        image: 'back',
      },
    });
    expect(state.context.idDoc.frontImage).toEqual('front');
    expect(state.context.idDoc.backImage).toEqual('back');
    expect(state.value).toEqual(States.processingDocuments);

    state = machine.send({
      type: Events.succeeded,
    });
    expect(state.value).toEqual(States.success);
  });

  it('collects selfie only', () => {
    const machine = interpret(createMachine());
    machine.start();
    let { state } = machine;
    expect(state.value).toBe(States.init);

    state = machine.send({
      type: Events.receivedContext,
      payload: {
        authToken: 'token',
        device: {
          type: 'mobile',
          hasSupportForWebauthn: true,
        },
        requestId: 'request',
        idDocRequired: false,
        selfieRequired: true,
      },
    });
    expect(state.context).toEqual({
      authToken: 'token',
      device: {
        type: 'mobile',
        hasSupportForWebauthn: true,
      },
      requestId: 'request',
      idDoc: {
        required: false,
      },
      selfie: {
        required: true,
      },
    });
    expect(state.value).toEqual(States.selfiePrompt);

    state = machine.send({
      type: Events.startSelfieCapture,
    });
    expect(state.value).toEqual(States.selfieImage);

    state = machine.send({
      type: Events.receivedSelfieImage,
      payload: {
        image: 'selfie',
      },
    });
    expect(state.context.selfie.image).toEqual('selfie');
    expect(state.value).toEqual(States.processingDocuments);

    state = machine.send({
      type: Events.succeeded,
    });
    expect(state.value).toEqual(States.success);
  });

  it('collects id doc + selfie', () => {
    const machine = interpret(createMachine());
    machine.start();
    let { state } = machine;
    expect(state.value).toBe(States.init);
    state = machine.send({
      type: Events.receivedContext,
      payload: {
        authToken: 'token',
        device: {
          type: 'mobile',
          hasSupportForWebauthn: true,
        },
        requestId: 'request',
        idDocRequired: true,
        selfieRequired: true,
      },
    });
    expect(state.context).toEqual({
      authToken: 'token',
      device: {
        type: 'mobile',
        hasSupportForWebauthn: true,
      },
      requestId: 'request',
      idDoc: {
        required: true,
      },
      selfie: {
        required: true,
      },
    });
    expect(state.value).toEqual(States.idDocCountryAndType);

    state = machine.send({
      type: Events.idDocCountryAndTypeSelected,
      payload: {
        type: IdDocType.idCard,
        country: 'USA',
      },
    });
    expect(state.value).toEqual(States.idDocFrontImage);

    state = machine.send({
      type: Events.receivedIdDocFrontImage,
      payload: {
        image: 'front',
      },
    });
    expect(state.context.idDoc.frontImage).toEqual('front');
    expect(state.value).toEqual(States.idDocBackImage);

    state = machine.send({
      type: Events.receivedIdDocBackImage,
      payload: {
        image: 'back',
      },
    });
    expect(state.context.idDoc.frontImage).toEqual('front');
    expect(state.context.idDoc.backImage).toEqual('back');
    expect(state.value).toEqual(States.selfiePrompt);

    state = machine.send({
      type: Events.startSelfieCapture,
    });
    expect(state.value).toEqual(States.selfieImage);

    state = machine.send({
      type: Events.receivedSelfieImage,
      payload: {
        image: 'selfie',
      },
    });
    expect(state.context.selfie.image).toEqual('selfie');
    expect(state.value).toEqual(States.processingDocuments);

    state = machine.send({
      type: Events.succeeded,
    });
    expect(state.value).toEqual(States.success);
  });

  it('retries id doc images on error', () => {
    const machine = interpret(createMachine());
    machine.start();
    let { state } = machine;
    expect(state.value).toBe(States.init);

    state = machine.send({
      type: Events.receivedContext,
      payload: {
        authToken: 'token',
        device: {
          type: 'mobile',
          hasSupportForWebauthn: true,
        },
        requestId: 'request',
        idDocRequired: true,
        selfieRequired: false,
      },
    });
    expect(state.value).toEqual(States.idDocCountryAndType);

    state = machine.send({
      type: Events.idDocCountryAndTypeSelected,
      payload: {
        type: IdDocType.idCard,
        country: 'USA',
      },
    });
    expect(state.value).toEqual(States.idDocFrontImage);

    state = machine.send({
      type: Events.receivedIdDocFrontImage,
      payload: {
        image: 'front',
      },
    });
    expect(state.context.idDoc.frontImage).toEqual('front');
    expect(state.value).toEqual(States.idDocBackImage);

    state = machine.send({
      type: Events.receivedIdDocBackImage,
      payload: {
        image: 'back',
      },
    });
    expect(state.context.idDoc.frontImage).toEqual('front');
    expect(state.context.idDoc.backImage).toEqual('back');
    expect(state.value).toEqual(States.processingDocuments);

    state = machine.send({
      type: Events.errored,
      payload: {
        errors: [
          IdDocBadImageError.barcodeNotDetected,
          IdDocBadImageError.documentBorderTooSmall,
        ],
      },
    });
    expect(state.value).toEqual(States.error);
    expect(state.context.idDoc.errors).toEqual([
      IdDocBadImageError.barcodeNotDetected,
      IdDocBadImageError.documentBorderTooSmall,
    ]);

    state = machine.send({
      type: Events.resubmitIdDocImages,
    });
    expect(state.context.idDoc.frontImage).toEqual(undefined);
    expect(state.context.idDoc.backImage).toEqual(undefined);
    expect(state.value).toBe(States.idDocFrontImage);
  });
});
