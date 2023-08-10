import { getCountryFromCode } from '@onefootprint/global-constants';
import { SupportedIdDocTypes, UploadDocumentSide } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import { MachineContext, MachineEvents } from './types';

const USCountryCode = getCountryFromCode('US').value;

const createIdDocMachine = (initialContext: Partial<MachineContext>) =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'idDoc',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0,
      context: {
        requirement: undefined,
        currentSide: UploadDocumentSide.Front,
        collectingDocumentMeta: {
          countryCode: USCountryCode,
          type: SupportedIdDocTypes.passport,
          docId: '',
        },
        ...initialContext,
      },
      initial: 'init',
      states: {
        init: {
          always: [
            {
              target: 'docSelection',
            },
          ],
        },
        docSelection: {
          on: {
            countryAndTypeSubmitted: {
              target: 'frontImage',
              actions: 'assignCountryAndType',
            },
          },
        },
        tooManyAttempts: {},
        frontImage: {
          on: {
            consentCompleted: {
              actions: 'assignConsent',
            },
            retryLimitExceeded: {
              target: 'tooManyAttempts',
            },
            backButtonTapped: {
              target: 'docSelection',
            },
            imageSubmitted: [
              {
                target: 'backImage',
                cond: (_, event) => event.payload.nextSideToCollect === 'back',
                actions: 'assignNextSideToCollect',
              },
              {
                target: 'selfie',
                cond: (_, event) =>
                  event.payload.nextSideToCollect === 'selfie',
                actions: 'assignNextSideToCollect',
              },
              {
                target: 'completed',
                actions: 'assignNextSideToCollect',
              },
            ],
          },
        },
        backImage: {
          on: {
            consentCompleted: {
              actions: 'assignConsent',
            },
            retryLimitExceeded: {
              target: 'tooManyAttempts',
            },
            imageSubmitted: [
              {
                target: 'selfie',
                cond: (_, event) =>
                  event.payload.nextSideToCollect === 'selfie',
                actions: 'assignNextSideToCollect',
              },
              {
                target: 'completed',
                actions: 'assignNextSideToCollect',
              },
            ],
          },
        },
        selfie: {
          on: {
            consentCompleted: {
              actions: 'assignConsent',
            },
            retryLimitExceeded: {
              target: 'tooManyAttempts',
            },
            imageSubmitted: [
              {
                target: 'completed',
                actions: 'assignNextSideToCollect',
              },
            ],
          },
        },
        completed: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        assignNextSideToCollect: assign((context, { payload }) => {
          return {
            ...context,
            currentSide: payload.nextSideToCollect,
          };
        }),
        assignConsent: assign(context => {
          return {
            ...context,
            requirement: {
              ...context.requirement,
              shouldCollectConsent: false,
            },
          };
        }),
        assignCountryAndType: assign((context, { payload }) => {
          return {
            ...context,
            collectingDocumentMeta: {
              docId: payload.docId,
              countryCode: payload.countryCode,
              type: payload.documentType,
            },
          };
        }),
      },
    },
  );

export default createIdDocMachine;
