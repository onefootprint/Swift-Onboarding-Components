import { IdDocBadImageError, IdDocType } from '@onefootprint/types';
import { interpret } from 'xstate';

import createIdDocMachine from './machine';

describe('Id Doc Machine Tests', () => {
  const createMachine = () => createIdDocMachine();
  it('collects id doc only', () => {
    const machine = interpret(createMachine());
    machine.start();
    let { state } = machine;
    expect(state.value).toBe('init');
    expect(state.context).toEqual({
      idDoc: {},
      selfie: {},
    });

    state = machine.send({
      type: 'receivedContext',
      payload: {
        authToken: 'token',
        device: {
          type: 'mobile',
          hasSupportForWebauthn: true,
        },
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
      idDoc: {
        required: true,
      },
      selfie: {
        required: false,
      },
    });
    expect(state.value).toEqual('idDocCountryAndType');

    state = machine.send({
      type: 'idDocCountryAndTypeSelected',
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
    expect(state.value).toEqual('idDocFrontImage');

    state = machine.send({
      type: 'receivedIdDocFrontImage',
      payload: {
        image: 'front',
      },
    });
    expect(state.context.idDoc.frontImage).toEqual('front');
    expect(state.value).toEqual('idDocBackImage');

    state = machine.send({
      type: 'receivedIdDocBackImage',
      payload: {
        image: 'back',
      },
    });
    expect(state.context.idDoc.frontImage).toEqual('front');
    expect(state.context.idDoc.backImage).toEqual('back');
    expect(state.value).toEqual('processingDocuments');

    state = machine.send({
      type: 'succeeded',
    });
    expect(state.value).toEqual('success');
  });

  it('collects selfie only', () => {
    const machine = interpret(createMachine());
    machine.start();
    let { state } = machine;
    expect(state.value).toBe('init');

    state = machine.send({
      type: 'receivedContext',
      payload: {
        authToken: 'token',
        device: {
          type: 'mobile',
          hasSupportForWebauthn: true,
        },
        idDocRequired: false,
        selfieRequired: true,
        consentRequired: true,
      },
    });
    expect(state.context).toEqual({
      authToken: 'token',
      device: {
        type: 'mobile',
        hasSupportForWebauthn: true,
      },
      idDoc: {
        required: false,
      },
      selfie: {
        required: true,
        consentRequired: true,
      },
    });
    expect(state.value).toEqual('selfiePrompt');

    state = machine.send({
      type: 'consentReceived',
    });
    expect(state.value).toEqual('selfiePrompt');

    state = machine.send({
      type: 'startSelfieCapture',
    });
    expect(state.value).toEqual('selfieImage');

    state = machine.send({
      type: 'receivedSelfieImage',
      payload: {
        image: 'selfie',
      },
    });
    expect(state.context.selfie.image).toEqual('selfie');
    expect(state.value).toEqual('processingDocuments');

    state = machine.send({
      type: 'succeeded',
    });
    expect(state.value).toEqual('success');
  });

  it('collects id doc + selfie', () => {
    const machine = interpret(createMachine());
    machine.start();
    let { state } = machine;
    expect(state.value).toBe('init');
    state = machine.send({
      type: 'receivedContext',
      payload: {
        authToken: 'token',
        device: {
          type: 'mobile',
          hasSupportForWebauthn: true,
        },
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
      idDoc: {
        required: true,
      },
      selfie: {
        required: true,
      },
    });
    expect(state.value).toEqual('idDocCountryAndType');

    state = machine.send({
      type: 'idDocCountryAndTypeSelected',
      payload: {
        type: IdDocType.idCard,
        country: 'USA',
      },
    });
    expect(state.value).toEqual('idDocFrontImage');

    state = machine.send({
      type: 'receivedIdDocFrontImage',
      payload: {
        image: 'front',
      },
    });
    expect(state.context.idDoc.frontImage).toEqual('front');
    expect(state.value).toEqual('idDocBackImage');

    state = machine.send({
      type: 'receivedIdDocBackImage',
      payload: {
        image: 'back',
      },
    });
    expect(state.context.idDoc.frontImage).toEqual('front');
    expect(state.context.idDoc.backImage).toEqual('back');
    expect(state.value).toEqual('selfiePrompt');

    state = machine.send({
      type: 'startSelfieCapture',
    });
    expect(state.value).toEqual('selfieImage');

    state = machine.send({
      type: 'receivedSelfieImage',
      payload: {
        image: 'selfie',
      },
    });
    expect(state.context.selfie.image).toEqual('selfie');
    expect(state.value).toEqual('processingDocuments');

    state = machine.send({
      type: 'succeeded',
    });
    expect(state.value).toEqual('success');
  });

  it('retries id doc images on error', () => {
    const machine = interpret(createMachine());
    machine.start();
    let { state } = machine;
    expect(state.value).toBe('init');

    state = machine.send({
      type: 'receivedContext',
      payload: {
        authToken: 'token',
        device: {
          type: 'mobile',
          hasSupportForWebauthn: true,
        },
        idDocRequired: true,
        selfieRequired: false,
      },
    });
    expect(state.value).toEqual('idDocCountryAndType');

    state = machine.send({
      type: 'idDocCountryAndTypeSelected',
      payload: {
        type: IdDocType.idCard,
        country: 'USA',
      },
    });
    expect(state.value).toEqual('idDocFrontImage');

    state = machine.send({
      type: 'receivedIdDocFrontImage',
      payload: {
        image: 'front',
      },
    });
    expect(state.context.idDoc.frontImage).toEqual('front');
    expect(state.value).toEqual('idDocBackImage');

    state = machine.send({
      type: 'receivedIdDocBackImage',
      payload: {
        image: 'back',
      },
    });
    expect(state.context.idDoc.frontImage).toEqual('front');
    expect(state.context.idDoc.backImage).toEqual('back');
    expect(state.value).toEqual('processingDocuments');

    state = machine.send({
      type: 'errored',
      payload: {
        errors: [
          IdDocBadImageError.barcodeNotDetected,
          IdDocBadImageError.documentBorderTooSmall,
        ],
      },
    });
    expect(state.value).toEqual('error');
    expect(state.context.idDoc.errors).toEqual([
      IdDocBadImageError.barcodeNotDetected,
      IdDocBadImageError.documentBorderTooSmall,
    ]);

    state = machine.send({
      type: 'resubmitIdDocImages',
    });
    expect(state.context.idDoc.frontImage).toEqual(undefined);
    expect(state.context.idDoc.backImage).toEqual(undefined);
    expect(state.value).toBe('idDocFrontImage');
  });

  it('can return to id doc country and type selection', () => {
    const machine = interpret(createMachine());
    machine.start();
    let { state } = machine;
    expect(state.value).toBe('init');
    state = machine.send({
      type: 'receivedContext',
      payload: {
        authToken: 'token',
        device: {
          type: 'mobile',
          hasSupportForWebauthn: true,
        },
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
      idDoc: {
        required: true,
      },
      selfie: {
        required: true,
      },
    });
    expect(state.value).toEqual('idDocCountryAndType');

    state = machine.send({
      type: 'idDocCountryAndTypeSelected',
      payload: {
        type: IdDocType.idCard,
        country: 'USA',
      },
    });
    expect(state.value).toEqual('idDocFrontImage');
    expect(state.context.idDoc.type).toEqual(IdDocType.idCard);
    expect(state.context.idDoc.country).toEqual('USA');

    state = machine.send({
      type: 'navigatedToPrev',
    });
    expect(state.value).toEqual('idDocCountryAndType');

    state = machine.send({
      type: 'idDocCountryAndTypeSelected',
      payload: {
        type: IdDocType.driversLicense,
        country: 'AFG',
      },
    });
    expect(state.value).toEqual('idDocFrontImage');
    expect(state.context.idDoc.type).toEqual(IdDocType.driversLicense);
    expect(state.context.idDoc.country).toEqual('AFG');
  });
});
