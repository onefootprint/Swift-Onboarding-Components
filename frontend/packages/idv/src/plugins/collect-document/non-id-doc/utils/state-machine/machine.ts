import { IdDocImageProcessingError } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import { Logger } from '@/idv/utils';
import { isDenied, isGranted, isMobileKind, isPrompt } from '../../../utils/capture';
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
      context: {
        cameraPermissionState: 'prompt',
        ...args,
      },
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
                target: 'mobileProcessing',
                actions: 'assignDocument',
                cond: ctx => isMobileKind(ctx.device.type),
              },
              {
                target: 'desktopProcessing',
                actions: 'assignDocument',
                cond: ctx => !isMobileKind(ctx.device.type),
              },
            ],
            startImageCapture: [
              {
                target: 'mobileRequestCameraAccess',
                cond: ctx => isMobileKind(ctx.device.type) && isPrompt(ctx.cameraPermissionState),
              },
              {
                target: 'mobileCameraAccessDenied',
                cond: ctx => isMobileKind(ctx.device.type) && isDenied(ctx.cameraPermissionState),
              },
              { target: 'mobileImageCapture' },
            ],
          },
        },
        mobileRequestCameraAccess: {
          on: {
            navigatedToPrev: { target: 'documentPrompt' },
            cameraAccessDenied: { target: 'mobileCameraAccessDenied', actions: 'assignCameraPermissionState' },
            cameraAccessGranted: [
              {
                target: 'mobileImageCapture',
                cond: (ctx, { payload }) => isMobileKind(ctx.device.type) && isGranted(payload.status),
                actions: ['assignCameraPermissionState'], // TODO: implement 'assignMediaStream' ?
              },
              {
                target: 'documentPrompt',
                actions: 'assignCameraPermissionState',
              },
            ],
          },
        },
        mobileCameraAccessDenied: {
          on: {
            navigatedToPrev: { target: 'mobileRequestCameraAccess' },
          },
        },
        mobileImageCapture: {
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
              target: 'mobileProcessing',
              actions: 'assignDocument',
            },
          },
        },
        mobileRetry: {
          on: {
            receivedDocument: {
              target: 'mobileProcessing',
              actions: ['assignDocument', 'clearErrors'],
            },
            navigatedToPrompt: {
              target: 'documentPrompt',
              actions: 'clearErrors',
            },
            startImageCapture: {
              target: 'mobileImageCapture',
              actions: 'clearErrors',
            },
          },
        },
        desktopRetry: {
          on: {
            receivedDocument: {
              target: 'desktopProcessing',
              actions: ['assignDocument', 'clearErrors'],
            },
            navigatedToPrompt: {
              target: 'documentPrompt',
              actions: 'clearErrors',
            },
            uploadErrored: {
              target: 'desktopRetry',
              actions: 'assignErrors',
            },
          },
        },
        mobileProcessing: {
          on: {
            processingSucceeded: {
              target: 'complete',
            },
            processingErrored: {
              target: 'mobileRetry',
              actions: ['assignErrors', 'assignHasBadConnectivity'],
            },
            retryLimitExceeded: {
              target: 'failure',
            },
          },
        },
        desktopProcessing: {
          on: {
            processingSucceeded: {
              target: 'complete',
            },
            processingErrored: {
              target: 'desktopRetry',
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
            forcedUpload: event.payload.forcedUpload,
          };
          Logger.info(
            `NonIDocMachine (func assignImage): size of the image file assigned to machine context is ${context.document?.imageFile?.size}, file type ${context.document?.imageFile?.type}`,
          );
          return context;
        }),
        assignHasBadConnectivity: assign((context, event) => {
          if (event.payload.errors.find(e => e.errorType === IdDocImageProcessingError.networkError)) {
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
        assignCameraPermissionState: assign((context, event) => {
          context.cameraPermissionState = event.payload.status;
          return context;
        }),
      },
    },
  );

export default createNonIdDocMachine;
