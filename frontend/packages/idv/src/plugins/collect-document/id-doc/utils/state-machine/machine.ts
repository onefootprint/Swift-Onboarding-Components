import { IdDocImageProcessingError, IdDocImageTypes } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import { getLogger } from '../../../../../utils/logger';
import { NextSideTargetsDesktop, NextSideTargetsMobile } from './machine.utils';
import type { MachineContext, MachineEvents } from './types';

const { logInfo } = getLogger({ location: 'machine-idDoc' });

const createIdDocMachine = (args: MachineContext, initState?: string) =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'idDoc',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: initState ?? 'countryAndType',
      context: { ...args },
      states: {
        countryAndType: {
          on: {
            receivedCountryAndType: [
              {
                target: 'mobileFrontPhotoFallback',
                cond: context => context.device.type === 'mobile' && !context.isConsentMissing && !!context.forceUpload,
                actions: ['assignCountryAndType', 'assignId', 'assignSide'],
              },
              {
                target: 'mobileFrontImageCapture',
                cond: context => context.device.type === 'mobile' && !context.isConsentMissing,
                actions: ['assignCountryAndType', 'assignId', 'assignSide'],
              },
              {
                target: 'desktopFrontImage',
                cond: context => context.device.type !== 'mobile' && !context.isConsentMissing,
                actions: ['assignCountryAndType', 'assignId', 'assignSide'],
              },
              {
                target: 'desktopConsent',
                cond: context => context.device.type !== 'mobile',
                actions: ['assignCountryAndType', 'assignId', 'assignSide'],
              },
              {
                actions: ['assignCountryAndType', 'assignId', 'assignSide'],
              },
            ],
            consentReceived: [
              {
                target: 'mobileFrontImageCapture',
                cond: context => !!context.id,
                actions: 'assignConsent',
              },
              {
                actions: 'assignConsent',
              },
            ],
          },
        },
        desktopConsent: {
          on: {
            navigatedToPrev: {
              target: 'countryAndType',
            },
            consentReceived: {
              target: 'desktopFrontImage',
              actions: 'assignConsent',
            },
          },
        },
        desktopFrontImage: {
          on: {
            receivedImage: {
              target: 'desktopProcessing',
              actions: 'assignImage',
            },
            uploadErrored: {
              target: 'desktopFrontImageRetry',
              actions: 'assignIdDocImageErrors',
            },
            navigatedToCountryDoc: {
              target: 'countryAndType',
              actions: 'clearImageAndErrors',
            },
          },
        },

        mobileFrontImageCapture: {
          on: {
            navigatedToPrev: {
              target: 'countryAndType',
            },

            cameraErrored: {
              target: 'countryAndType',
            },
            cameraStuck: {
              target: 'mobileFrontPhotoFallback',
              actions: 'assignForcedUpload',
            },

            receivedImage: {
              target: 'mobileProcessing',
              actions: 'assignImage',
            },
          },
        },
        // Called when there is an issue with camera and we need to fallback to upload
        mobileFrontPhotoFallback: {
          on: {
            navigatedToPrev: {
              target: 'countryAndType',
            },
            receivedImage: {
              target: 'mobileProcessing',
              actions: 'assignImage',
            },
          },
        },
        mobileFrontImageRetry: {
          on: {
            receivedImage: {
              target: 'mobileProcessing',
              actions: 'assignImage',
            },
            startImageCapture: {
              target: 'mobileFrontImageCapture',
            },
            navigatedToCountryDoc: {
              target: 'countryAndType',
              actions: 'clearImageAndErrors',
            },
          },
        },
        desktopFrontImageRetry: {
          on: {
            receivedImage: {
              target: 'desktopProcessing',
              actions: 'assignImage',
            },
            uploadErrored: {
              target: 'desktopFrontImageRetry',
              actions: 'assignIdDocImageErrors',
            },
            navigatedToCountryDoc: {
              target: 'countryAndType',
              actions: 'clearImageAndErrors',
            },
          },
        },
        desktopBackImage: {
          on: {
            receivedImage: {
              target: 'desktopProcessing',
              actions: 'assignImage',
            },
            uploadErrored: {
              target: 'desktopBackImageRetry',
              actions: 'assignIdDocImageErrors',
            },
          },
        },
        mobileBackImageCapture: {
          on: {
            navigatedToPrev: {
              target: 'countryAndType',
            },
            receivedImage: {
              target: 'mobileProcessing',
              actions: 'assignImage',
            },
          },
        },
        // Called when there is an issue with camera and we need to fallback to upload
        mobileBackPhotoFallback: {
          on: {
            navigatedToPrev: {
              target: 'countryAndType',
            },
            receivedImage: {
              target: 'mobileProcessing',
              actions: 'assignImage',
            },
          },
        },
        desktopBackImageRetry: {
          on: {
            receivedImage: {
              target: 'desktopProcessing',
              actions: 'assignImage',
            },
            uploadErrored: {
              target: 'desktopBackImageRetry',
              actions: 'assignIdDocImageErrors',
            },
            navigatedToCountryDoc: {
              target: 'countryAndType',
              actions: 'clearImageAndErrors',
            },
          },
        },
        mobileBackImageRetry: {
          on: {
            receivedImage: {
              target: 'mobileProcessing',
              actions: 'assignImage',
            },
            startImageCapture: {
              target: 'mobileBackImageCapture',
            },
            navigatedToCountryDoc: {
              target: 'countryAndType',
              actions: 'clearImageAndErrors',
            },
          },
        },
        mobileSelfieImage: {
          on: {
            navigatedToPrev: {
              target: 'countryAndType',
            },
            receivedImage: {
              target: 'mobileProcessing',
              actions: 'assignImage',
            },
          },
        },
        // Called when there is an issue with camera and we need to fallback to upload
        mobileSelfieFallback: {
          on: {
            navigatedToPrev: {
              target: 'countryAndType',
            },
            receivedImage: {
              target: 'mobileProcessing',
              actions: 'assignImage',
            },
          },
        },
        desktopSelfieImage: {
          on: {
            receivedImage: {
              target: 'desktopProcessing',
              actions: 'assignImage',
            },
            cameraStuck: {
              target: 'desktopSelfieFallback',
              actions: 'assignForcedUpload',
            },
          },
        },
        desktopSelfieFallback: {
          on: {
            receivedImage: {
              target: 'desktopProcessing',
              actions: 'assignImage',
            },
          },
        },
        mobileSelfieImageRetry: {
          on: {
            startImageCapture: {
              target: 'mobileSelfieImage',
            },
            receivedImage: {
              target: 'mobileProcessing',
              actions: 'assignImage',
            },
          },
        },
        desktopSelfieImageRetry: {
          on: {
            startImageCapture: {
              target: 'desktopSelfieImage',
            },
            receivedImage: {
              target: 'desktopProcessing',
              actions: 'assignImage',
            },
          },
        },
        mobileProcessing: {
          on: {
            processingSucceeded: NextSideTargetsMobile,
            processingErrored: [
              {
                target: 'mobileFrontImageRetry',
                cond: context => context.currSide === 'front',
                actions: ['assignIdDocImageErrors', 'assignHasBadConnectivity'],
              },
              {
                target: 'mobileBackImageRetry',
                cond: context => context.currSide === 'back',
                actions: ['assignIdDocImageErrors', 'assignHasBadConnectivity'],
              },
              {
                target: 'mobileSelfieImageRetry',
                cond: context => context.currSide === 'selfie',
                actions: ['assignIdDocImageErrors', 'assignHasBadConnectivity'],
              },
            ],
            retryLimitExceeded: {
              target: 'failure',
            },
          },
        },
        desktopProcessing: {
          on: {
            processingSucceeded: NextSideTargetsDesktop,
            processingErrored: [
              {
                target: 'desktopFrontImageRetry',
                cond: context => context.currSide === 'front',
                actions: ['assignIdDocImageErrors', 'assignHasBadConnectivity'],
              },
              {
                target: 'desktopBackImageRetry',
                cond: context => context.currSide === 'back',
                actions: ['assignIdDocImageErrors', 'assignHasBadConnectivity'],
              },
              {
                target: 'desktopSelfieImageRetry',
                cond: context => context.currSide === 'selfie',
                actions: ['assignIdDocImageErrors', 'assignHasBadConnectivity'],
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
        assignId: assign((context, event) => {
          context.id = event.payload.id;
          return context;
        }),
        assignSide: assign(context => {
          context.currSide = IdDocImageTypes.front;
          return context;
        }),
        assignImage: assign((context, event) => {
          context.image = {
            imageFile: event.payload.imageFile,
            captureKind: event.payload.captureKind,
            extraCompressed: event.payload.extraCompressed,
          };
          logInfo(
            `IdDocMachine (func assignImage): size of the image file assigned to machine context is ${context.image?.imageFile?.size}, file type ${context.image?.imageFile?.type}`,
          );
          return context;
        }),
        assignHasBadConnectivity: assign((context, event) => {
          if (event.payload.errors.find(e => e.errorType === IdDocImageProcessingError.networkError)) {
            context.hasBadConnectivity = true;
          }
          return context;
        }),
        assignIdDocImageErrors: assign((context, event) => {
          context.errors = event.payload.errors;
          context.image = undefined;
          return context;
        }),
        assignConsent: assign(context => {
          context.isConsentMissing = false;
          return context;
        }),
        clearImageAndErrors: assign(context => {
          context.errors = [];
          context.image = undefined;
          return context;
        }),
        assignForcedUpload: assign(context => {
          context.forceUpload = true;
          return context;
        }),
      },
    },
  );

export default createIdDocMachine;
