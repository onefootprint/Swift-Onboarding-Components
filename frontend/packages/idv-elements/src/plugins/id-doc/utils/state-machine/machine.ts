import { assign, createMachine } from 'xstate';

import NextSideTargets from './machine.utils';
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
      initial: 'init',
      context: { ...args },
      states: {
        init: {
          always: [
            {
              target: 'incompatibleDevice',
              cond: context => context.device.type !== 'mobile',
            },
            {
              target: 'frontImage',
              cond: context =>
                !!context.requirement.onlyUsSupported &&
                context.requirement.supportedDocumentTypes?.length === 1,
            },
            {
              target: 'countryAndType',
            },
          ],
        },
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
            navigatedToPrev: {
              target: 'countryAndType',
            },
            receivedImage: {
              target: 'processing',
              actions: 'assignImage',
            },
            startImageCapture: {
              target: 'frontImageCapture',
            },
          },
        },
        frontImageCapture: {
          on: {
            navigatedToPrev: {
              target: 'frontImage',
            },
            cameraErrored: {
              target: 'frontImage',
            },
            receivedImage: {
              target: 'processing',
              actions: 'assignImage',
            },
          },
        },
        frontImageRetry: {
          on: {
            receivedImage: {
              target: 'processing',
              actions: 'assignImage',
            },
            startImageCapture: {
              target: 'frontImageCapture',
            },
          },
        },
        backImage: {
          on: {
            receivedImage: {
              target: 'processing',
              actions: 'assignImage',
            },
            startImageCapture: {
              target: 'backImageCapture',
            },
          },
        },
        backImageCapture: {
          on: {
            navigatedToPrev: {
              target: 'backImage',
            },
            cameraErrored: {
              target: 'backImage',
            },
            receivedImage: {
              target: 'processing',
              actions: 'assignImage',
            },
          },
        },
        backImageRetry: {
          on: {
            receivedImage: {
              target: 'processing',
              actions: 'assignImage',
            },
            startImageCapture: {
              target: 'backImageCapture',
            },
          },
        },
        selfiePrompt: {
          on: {
            consentReceived: {
              actions: 'assignConsent',
            },
            startImageCapture: {
              target: 'selfieImage',
              cond: context => !context.requirement.shouldCollectConsent,
            },
          },
        },
        selfieImage: {
          on: {
            navigatedToPrev: {
              target: 'selfiePrompt',
            },
            cameraErrored: {
              target: 'selfiePrompt',
            },
            receivedImage: {
              target: 'processing',
              actions: 'assignImage',
            },
          },
        },
        selfieImageRetry: {
          on: {
            startImageCapture: {
              target: 'selfieImage',
            },
          },
        },
        processing: {
          on: {
            processingSucceeded: NextSideTargets,
            processingErrored: [
              {
                target: 'frontImageRetry',
                cond: context => context.currSide === 'front',
                actions: 'assignIdDocImageErrors',
              },
              {
                target: 'backImageRetry',
                cond: context => context.currSide === 'back',
                actions: 'assignIdDocImageErrors',
              },
              {
                target: 'selfieImageRetry',
                cond: context => context.currSide === 'selfie',
                actions: 'assignIdDocImageErrors',
              },
            ],
            retryLimitExceeded: {
              target: 'failure',
            },
          },
        },
        complete: {
          type: 'final',
        },
        failure: {
          type: 'final',
        },
        incompatibleDevice: {
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
          context.requirement.shouldCollectConsent = false;
          return context;
        }),
      },
    },
  );

export default createIdDocMachine;
