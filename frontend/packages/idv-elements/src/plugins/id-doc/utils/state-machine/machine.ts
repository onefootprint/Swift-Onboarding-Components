import {
  IdDocImageProcessingError,
  IdDocImageTypes,
} from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

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
      initial: initState ?? 'init',
      context: { ...args },
      states: {
        init: {
          always: [
            {
              target: 'countryAndType',
            },
          ],
        },
        countryAndType: {
          on: {
            receivedCountryAndType: [
              {
                target: 'frontImageMobile',
                cond: context => context.device.type === 'mobile',
                actions: ['assignCountryAndType', 'assignId', 'resetSide'],
              },
              {
                target: 'consentDesktop',
                cond: context => context.device.type !== 'mobile',
                actions: ['assignCountryAndType', 'assignId', 'resetSide'],
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
        frontImageMobile: {
          on: {
            navigatedToPrev: {
              target: 'countryAndType',
            },
            consentReceived: {
              actions: 'assignConsent',
            },
            startImageCapture: {
              target: 'frontImageCaptureMobile',
              cond: context => !context.requirement.shouldCollectConsent,
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
              target: 'frontImageMobile',
            },
            cameraErrored: {
              target: 'frontImageMobile',
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
        backImageMobile: {
          on: {
            startImageCapture: {
              target: 'backImageCaptureMobile',
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
              target: 'backImageMobile',
            },
            cameraErrored: {
              target: 'backImageMobile',
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
        selfiePromptMobile: {
          on: {
            startImageCapture: {
              target: 'selfieImageMobile',
            },
          },
        },
        selfieImageMobile: {
          on: {
            navigatedToPrev: {
              target: 'selfiePromptMobile',
            },
            cameraErrored: {
              target: 'selfiePromptMobile',
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
          },
        },
        selfieImageRetryMobile: {
          on: {
            startImageCapture: {
              target: 'selfieImageMobile',
            },
          },
        },
        selfieImageRetryDesktop: {
          on: {
            startImageCapture: {
              target: 'selfieImageDesktop',
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
          };
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
          context.requirement.shouldCollectConsent = false;
          return context;
        }),
        clearImageAndErrors: assign(context => {
          context.errors = [];
          context.image = undefined;
          return context;
        }),
      },
    },
  );

export default createIdDocMachine;
