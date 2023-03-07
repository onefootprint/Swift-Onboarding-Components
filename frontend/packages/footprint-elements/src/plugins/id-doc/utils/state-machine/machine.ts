import { assign, createMachine } from 'xstate';

import ImagesRequiredByIdDocType from '../../constants/images-required-by-id-doc-type';
import { MachineContext, MachineEvents } from './types';

const createIdDocMachine = () =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'idDoc',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'init',
      context: {
        idDoc: {},
        selfie: {},
      },
      states: {
        init: {
          on: {
            receivedContext: [
              {
                target: 'idDocCountryAndType',
                actions: 'assignContext',
                cond: (context, event) => !!event.payload.idDocRequired,
              },
              {
                target: 'selfiePrompt',
                actions: 'assignContext',
                cond: (context, event) => !!event.payload.selfieRequired,
              },
              {
                target: 'success',
              },
            ],
          },
        },
        idDocCountryAndType: {
          on: {
            idDocCountryAndTypeSelected: {
              target: 'idDocFrontImage',
              actions: 'assignIdDocCountryAndType',
            },
          },
        },
        idDocFrontImage: {
          on: {
            navigatedToPrev: {
              target: 'idDocCountryAndType',
            },
            receivedIdDocFrontImage: [
              {
                target: 'idDocBackImage',
                actions: 'assignIdDocFrontImage',
                cond: context => {
                  const {
                    idDoc: { type },
                  } = context;
                  return type ? !!ImagesRequiredByIdDocType[type].back : false;
                },
              },
              {
                target: 'selfiePrompt',
                cond: context => !!context.selfie.required,
                actions: 'assignIdDocFrontImage',
              },
              {
                target: 'processingDocuments',
                actions: 'assignIdDocFrontImage',
              },
            ],
          },
        },
        idDocBackImage: {
          on: {
            receivedIdDocBackImage: [
              {
                target: 'selfiePrompt',
                cond: context => !!context.selfie.required,
                actions: 'assignIdDocBackImage',
              },
              {
                target: 'processingDocuments',
                actions: 'assignIdDocBackImage',
              },
            ],
          },
        },
        selfiePrompt: {
          on: {
            consentReceived: {
              actions: ['assignConsent'],
            },
            startSelfieCapture: {
              target: 'selfieImage',
            },
          },
        },
        selfieImage: {
          on: {
            cameraErrored: {
              target: 'selfiePrompt',
            },
            receivedSelfieImage: {
              target: 'processingDocuments',
              actions: 'assignSelfie',
            },
          },
        },
        processingDocuments: {
          on: {
            succeeded: {
              target: 'success',
            },
            errored: [
              {
                target: 'error',
                actions: 'assignIdDocImageErrors',
              },
            ],
            retryLimitExceeded: {
              target: 'failure',
            },
          },
        },
        error: {
          on: {
            resubmitIdDocImages: {
              target: 'idDocFrontImage',
            },
          },
        },
        success: {
          type: 'final',
        },
        failure: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        assignContext: assign((context, event) => {
          const {
            authToken,
            device,
            idDocRequired,
            selfieRequired,
            consentRequired,
          } = event.payload;
          context.authToken = authToken;
          context.device = { ...device };
          context.idDoc.required = idDocRequired;
          context.selfie.required = selfieRequired;
          context.selfie.consentRequired = consentRequired;
          return context;
        }),
        assignIdDocCountryAndType: assign((context, event) => {
          context.idDoc.type = event.payload.type;
          context.idDoc.country = event.payload.country;
          return context;
        }),
        assignIdDocFrontImage: assign((context, event) => {
          context.idDoc.frontImage = event.payload.image;
          return context;
        }),
        assignIdDocBackImage: assign((context, event) => {
          context.idDoc.backImage = event.payload.image;
          return context;
        }),
        assignConsent: assign(context => {
          context.selfie.consentRequired = false;
          return context;
        }),
        assignSelfie: assign((context, event) => {
          context.selfie.image = event.payload.image;
          return context;
        }),
        assignIdDocImageErrors: assign((context, event) => {
          context.idDoc.errors = event.payload.errors;
          context.idDoc.frontImage = undefined;
          context.idDoc.backImage = undefined;
          return context;
        }),
      },
    },
  );

export default createIdDocMachine;
