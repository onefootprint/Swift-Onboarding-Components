import { getCountryFromCode } from '@onefootprint/global-constants';
import { IdDocRequirement, UploadDocumentSide } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import { MachineContext, MachineEvents } from './types';

const createIdDocMachine = (requirement: IdDocRequirement) =>
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
          countryCode: getInitialCountry(requirement),
          type: undefined,
          docId: undefined,
        },
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
            backButtonTapped: {
              target: 'docSelection',
            },
            consentCompleted: {
              actions: 'assignConsent',
            },
            retryLimitExceeded: {
              target: 'tooManyAttempts',
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
            currentSide: UploadDocumentSide.Front,
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

const getInitialCountry = (requirement: IdDocRequirement) => {
  const hasUS = requirement.supportedCountries.includes('US');
  if (hasUS) {
    return getCountryFromCode('US').value;
  }
  const [firstCountry] = requirement.supportedCountries;
  return getCountryFromCode(firstCountry).value;
};

export default createIdDocMachine;
