import { assign, createMachine } from 'xstate';

import { NextSideTargetsDesktop, NextSideTargetsMobile } from './machine.utils';
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
                actions: ['assignCountryAndType', 'assignId'],
              },
              {
                target: 'consentDesktop',
                cond: context => context.device.type !== 'mobile',
                actions: ['assignCountryAndType', 'assignId'],
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
                actions: 'assignIdDocImageErrors',
              },
              {
                target: 'backImageRetryMobile',
                cond: context => context.currSide === 'back',
                actions: 'assignIdDocImageErrors',
              },
              {
                target: 'selfieImageRetryMobile',
                cond: context => context.currSide === 'selfie',
                actions: 'assignIdDocImageErrors',
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
                actions: 'assignIdDocImageErrors',
              },
              {
                target: 'backImageRetryDesktop',
                cond: context => context.currSide === 'back',
                actions: 'assignIdDocImageErrors',
              },
              {
                target: 'selfieImageRetryDesktop',
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
        assignImage: assign((context, event) => {
          context.image = {
            imageString: event.payload.imageString,
            mimeType: event.payload.mimeType,
          };
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
