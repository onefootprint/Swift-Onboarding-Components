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
            navigatedToPrev: {
              target: 'countryAndType',
            },
            receivedImage: {
              target: 'frontImageProcessing',
              actions: 'assignImage',
            },
          },
        },
        frontImageProcessing: {
          on: {
            processingSucceeded: NextSideTargets,
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
            processingSucceeded: NextSideTargets,
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
            processingSucceeded: NextSideTargets,
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
        complete: {
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
