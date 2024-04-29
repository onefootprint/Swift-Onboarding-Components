import {
  IdDocImageProcessingError,
  IdDocImageTypes,
} from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import Logger from '../../../../../utils/logger';
import { NextSideTargetsDesktop, NextSideTargetsMobile } from './machine.utils';
import type { MachineContext, MachineEvents } from './types';

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
                cond: context =>
                  context.device.type === 'mobile' &&
                  !context.shouldCollectConsent &&
                  !!context.forceUpload,
                actions: ['assignCountryAndType', 'assignId', 'resetSide'],
              },
              {
                target: 'frontImageCaptureMobile',
                cond: context =>
                  context.device.type === 'mobile' &&
                  !context.shouldCollectConsent,
                actions: ['assignCountryAndType', 'assignId', 'resetSide'],
              },
              {
                target: 'frontImageDesktop',
                cond: context =>
                  context.device.type !== 'mobile' &&
                  !context.shouldCollectConsent,
                actions: ['assignCountryAndType', 'assignId', 'resetSide'],
              },
              {
                target: 'consentDesktop',
                cond: context => context.device.type !== 'mobile',
                actions: ['assignCountryAndType', 'assignId', 'resetSide'],
              },
              {
                actions: ['assignCountryAndType', 'assignId', 'resetSide'],
              },
            ],
            consentReceived: [
              {
                target: 'frontImageCaptureMobile',
                cond: context => !!context.id,
                actions: 'assignConsent',
              },
              {
                actions: 'assignConsent',
              },
            ],
          },
        },
        consentDesktop: {
          on: {
            navigatedToPrev: {
              target: 'countryAndType',
            },
            consentReceived: {
              target: 'frontImageDesktop',
              actions: 'assignConsent',
            },
          },
        },
        frontImageDesktop: {
          on: {
            receivedImage: {
              target: 'processingDesktop',
              actions: 'assignImage',
            },
            uploadErrored: {
              target: 'frontImageRetryDesktop',
              actions: 'assignIdDocImageErrors',
            },
            navigatedToCountryDoc: {
              target: 'countryAndType',
              actions: 'clearImageAndErrors',
            },
          },
        },

        frontImageCaptureMobile: {
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
              target: 'processingMobile',
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
              target: 'processingMobile',
              actions: 'assignImage',
            },
          },
        },
        frontImageRetryMobile: {
          on: {
            receivedImage: {
              target: 'processingMobile',
              actions: 'assignImage',
            },
            startImageCapture: {
              target: 'frontImageCaptureMobile',
            },
            navigatedToCountryDoc: {
              target: 'countryAndType',
              actions: 'clearImageAndErrors',
            },
          },
        },
        frontImageRetryDesktop: {
          on: {
            receivedImage: {
              target: 'processingDesktop',
              actions: 'assignImage',
            },
            uploadErrored: {
              target: 'frontImageRetryDesktop',
              actions: 'assignIdDocImageErrors',
            },
            navigatedToCountryDoc: {
              target: 'countryAndType',
              actions: 'clearImageAndErrors',
            },
          },
        },
        backImageDesktop: {
          on: {
            receivedImage: {
              target: 'processingDesktop',
              actions: 'assignImage',
            },
            uploadErrored: {
              target: 'backImageRetryDesktop',
              actions: 'assignIdDocImageErrors',
            },
          },
        },
        backImageCaptureMobile: {
          on: {
            navigatedToPrev: {
              target: 'countryAndType',
            },
            receivedImage: {
              target: 'processingMobile',
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
              target: 'processingMobile',
              actions: 'assignImage',
            },
          },
        },
        backImageRetryDesktop: {
          on: {
            receivedImage: {
              target: 'processingDesktop',
              actions: 'assignImage',
            },
            uploadErrored: {
              target: 'backImageRetryDesktop',
              actions: 'assignIdDocImageErrors',
            },
            navigatedToCountryDoc: {
              target: 'countryAndType',
              actions: 'clearImageAndErrors',
            },
          },
        },
        backImageRetryMobile: {
          on: {
            receivedImage: {
              target: 'processingMobile',
              actions: 'assignImage',
            },
            startImageCapture: {
              target: 'backImageCaptureMobile',
            },
            navigatedToCountryDoc: {
              target: 'countryAndType',
              actions: 'clearImageAndErrors',
            },
          },
        },
        selfieImageMobile: {
          on: {
            navigatedToPrev: {
              target: 'countryAndType',
            },
            receivedImage: {
              target: 'processingMobile',
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
              target: 'processingMobile',
              actions: 'assignImage',
            },
          },
        },
        selfieImageDesktop: {
          on: {
            receivedImage: {
              target: 'processingDesktop',
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
              target: 'processingDesktop',
              actions: 'assignImage',
            },
          },
        },
        selfieImageRetryMobile: {
          on: {
            startImageCapture: {
              target: 'selfieImageMobile',
            },
            receivedImage: {
              target: 'processingMobile',
              actions: 'assignImage',
            },
          },
        },
        selfieImageRetryDesktop: {
          on: {
            startImageCapture: {
              target: 'selfieImageDesktop',
            },
            receivedImage: {
              target: 'processingDesktop',
              actions: 'assignImage',
            },
          },
        },
        processingMobile: {
          on: {
            processingSucceeded: NextSideTargetsMobile,
            processingErrored: [
              {
                target: 'frontImageRetryMobile',
                cond: context => context.currSide === 'front',
                actions: ['assignIdDocImageErrors', 'assignHasBadConnectivity'],
              },
              {
                target: 'backImageRetryMobile',
                cond: context => context.currSide === 'back',
                actions: ['assignIdDocImageErrors', 'assignHasBadConnectivity'],
              },
              {
                target: 'selfieImageRetryMobile',
                cond: context => context.currSide === 'selfie',
                actions: ['assignIdDocImageErrors', 'assignHasBadConnectivity'],
              },
            ],
            retryLimitExceeded: {
              target: 'failure',
            },
          },
        },
        processingDesktop: {
          on: {
            processingSucceeded: NextSideTargetsDesktop,
            processingErrored: [
              {
                target: 'frontImageRetryDesktop',
                cond: context => context.currSide === 'front',
                actions: ['assignIdDocImageErrors', 'assignHasBadConnectivity'],
              },
              {
                target: 'backImageRetryDesktop',
                cond: context => context.currSide === 'back',
                actions: ['assignIdDocImageErrors', 'assignHasBadConnectivity'],
              },
              {
                target: 'selfieImageRetryDesktop',
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
        resetSide: assign(context => {
          context.currSide = IdDocImageTypes.front;
          return context;
        }),
        assignImage: assign((context, event) => {
          context.image = {
            imageFile: event.payload.imageFile,
            captureKind: event.payload.captureKind,
            extraCompressed: event.payload.extraCompressed,
          };
          Logger.info(
            `IdDocMachine (func assignImage): size of the image file assigned to machine context is ${context.image?.imageFile?.size}, file type ${context.image?.imageFile?.type}`,
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
        assignIdDocImageErrors: assign((context, event) => {
          context.errors = event.payload.errors;
          context.image = undefined;
          return context;
        }),
        assignConsent: assign(context => {
          context.shouldCollectConsent = false;
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
