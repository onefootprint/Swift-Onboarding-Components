import { assign, createMachine } from 'xstate';

import ImagesRequiredByIdDocType from '../../constants/images-required-by-id-doc-type';
import { MachineContext, MachineEvents } from './types';

const createIdDocMachine = (args: MachineContext) =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'idDoc',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'countryAndType',
      context: { ...args },
      states: {
        countryAndType: {
          on: {
            receivedCountryAndType: {
              target: 'frontImage',
              actions: 'assignCountryAndType',
            },
          },
        },
        frontImage: {
          on: {
            receivedImage: {
              target: 'frontImageProcessing',
              actions: 'assignImage',
            },
          },
        },
        frontImageProcessing: {
          on: {
            navigatedToPrev: {
              target: 'countryAndType',
            },
            processingSucceeded: [
              {
                target: 'backImage',
                cond: context => {
                  const {
                    idDoc: { type },
                  } = context;
                  return type ? !!ImagesRequiredByIdDocType[type].back : false;
                },
              },
              {
                target: 'selfiePrompt',
                cond: context => context.requirement.shouldCollectSelfie,
              },
              {
                target: 'success',
              },
            ],
            processingErrored: {
              target: 'frontImageRetry',
              actions: 'assignIdDocImageErrors',
            },
          },
        },
        frontImageRetry: {
          on: {
            receivedImage: {
              target: 'frontImageProcessing',
              actions: 'assignImage',
            },
          },
        },
        backImage: {
          on: {
            receivedImage: {
              target: 'backImageProcessing',
              actions: 'assignImage',
            },
          },
        },
        backImageProcessing: {
          on: {
            processingSucceeded: [
              {
                target: 'selfiePrompt',
                cond: context => context.requirement.shouldCollectSelfie,
              },
              {
                target: 'success',
              },
            ],
            processingErrored: {
              target: 'backImageRetry',
              actions: 'assignIdDocImageErrors',
            },
          },
        },
        backImageRetry: {
          on: {
            receivedImage: {
              target: 'backImageProcessing',
              actions: 'assignImage',
            },
          },
        },
        selfiePrompt: {
          on: {
            consentReceived: {
              actions: 'assignConsent',
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
            receivedImage: {
              target: 'selfieImageProcessing',
              actions: 'assignImage',
            },
          },
        },
        selfieImageProcessing: {
          on: {
            processingSucceeded: {
              target: 'success',
            },
            processingErrored: {
              target: 'selfieImageRetry',
              actions: 'assignIdDocImageErrors',
            },
          },
        },
        selfieImageRetry: {
          on: {
            cameraErrored: {
              target: 'selfiePrompt',
            },
            receivedImage: {
              target: 'selfieImageProcessing',
              actions: 'assignImage',
            },
          },
        },
        success: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        assignCountryAndType: assign((context, event) => {
          context.idDoc = {
            type: event.payload.type,
            country: event.payload.country,
          };
          return context;
        }),
        assignImage: assign((context, event) => {
          context.image = event.payload.image;
          return context;
        }),
        assignIdDocImageErrors: assign((context, event) => {
          context.errors = event.payload.errors;
          context.image = undefined;
          return context;
        }),
        assignConsent: assign(context => {
          context.selfie.consentRequired = false;
          return context;
        }),
      },
    },
  );

export default createIdDocMachine;
