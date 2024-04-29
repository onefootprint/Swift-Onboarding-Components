import { IdDocImageProcessingError } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import Logger from '../../../../../utils/logger';
import type { MachineContext, MachineEvents } from './types';

const createNonIdDocMachine = (args: MachineContext) =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'nonIdDocMachine',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'init',
      context: { ...args },
      states: {
        init: {
          on: {
            contextInitialized: [
              {
                target: 'documentPrompt',
                actions: 'assignId',
              },
            ],
          },
        },
        documentPrompt: {
          on: {
            receivedDocument: [
              {
                target: 'processingMobile',
                actions: 'assignDocument',
                cond: context => context.device.type === 'mobile',
              },
              {
                target: 'processingDesktop',
                actions: 'assignDocument',
                cond: context => context.device.type !== 'mobile',
              },
            ],
            startImageCapture: {
              target: 'imageCaptureMobile',
            },
          },
        },
        imageCaptureMobile: {
          on: {
            navigatedToPrev: {
              target: 'documentPrompt',
            },
            cameraErrored: {
              target: 'documentPrompt',
            },
            cameraStuck: {
              target: 'documentPrompt',
            },
            receivedDocument: {
              target: 'processingMobile',
              actions: 'assignDocument',
            },
          },
        },
        retryMobile: {
          on: {
            receivedDocument: {
              target: 'processingMobile',
              actions: ['assignDocument', 'clearErrors'],
            },
            navigatedToPrompt: {
              target: 'documentPrompt',
              actions: 'clearErrors',
            },
            startImageCapture: {
              target: 'imageCaptureMobile',
              actions: 'clearErrors',
            },
          },
        },
        retryDesktop: {
          on: {
            receivedDocument: {
              target: 'processingDesktop',
              actions: ['assignDocument', 'clearErrors'],
            },
            navigatedToPrompt: {
              target: 'documentPrompt',
              actions: 'clearErrors',
            },
            uploadErrored: {
              target: 'retryDesktop',
              actions: 'assignErrors',
            },
          },
        },
        processingMobile: {
          on: {
            processingSucceeded: {
              target: 'complete',
            },
            processingErrored: {
              target: 'retryMobile',
              actions: ['assignErrors', 'assignHasBadConnectivity'],
            },
            retryLimitExceeded: {
              target: 'failure',
            },
          },
        },
        processingDesktop: {
          on: {
            processingSucceeded: {
              target: 'complete',
            },
            processingErrored: {
              target: 'retryDesktop',
              actions: ['assignErrors', 'assignHasBadConnectivity'],
            },
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
      },
    },
    {
      actions: {
        assignId: assign((context, event) => {
          context.id = event.payload.id;
          return context;
        }),
        assignDocument: assign((context, event) => {
          context.document = {
            imageFile: event.payload.imageFile,
            captureKind: event.payload.captureKind,
            extraCompressed: event.payload.extraCompressed,
          };
          Logger.info(
            `NonIDocMachine (func assignImage): size of the image file assigned to machine context is ${context.document?.imageFile?.size}, file type ${context.document?.imageFile?.type}`,
          );
          return context;
        }),
        assignHasBadConnectivity: assign((context, event) => {
          if (
            event.payload.errors.find(
              e => e.errorType === IdDocImageProcessingError.networkError,
            )
          ) {
            context.hasBadConnectivity = true;
          }
          return context;
        }),
        assignErrors: assign((context, event) => {
          context.errors = event.payload.errors;
          context.document = undefined;
          return context;
        }),
        clearErrors: assign(context => {
          context.errors = undefined;
          return context;
        }),
      },
    },
  );

export default createNonIdDocMachine;
