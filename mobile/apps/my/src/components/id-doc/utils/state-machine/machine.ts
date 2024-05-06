import { getCountryFromCode } from '@onefootprint/global-constants';
import type { CountryCode, IdDocRequirement } from '@onefootprint/types';
import { isIdentitydDoc, UploadDocumentSide } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import type { MachineContext, MachineEvents } from './types';

const createIdDocMachine = (requirement: IdDocRequirement) =>
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
      context: {
        requirement,
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
            consentCompleted: {
              actions: 'assignConsent',
            },
          },
        },
        frontImage: {
          on: {
            backButtonTapped: {
              target: 'docSelection',
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
        tooManyAttempts: {
          type: 'final',
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
          console.log('assignCountryAndType');
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
  if (isIdentitydDoc(requirement.config)) {
    const { supportedCountryAndDocTypes } = requirement.config;

    // Check for 'US' considering case sensitivity
    const hasUS =
      supportedCountryAndDocTypes.US || supportedCountryAndDocTypes.us;
    if (hasUS) {
      const value = getCountryFromCode('US')?.value;
      if (value) return value;
    }

    // Get the first country from the supportedCountryAndDocTypes object
    const firstCountryCode = Object.keys(supportedCountryAndDocTypes)[0];
    const value = getCountryFromCode(firstCountryCode as CountryCode)?.value;
    if (value) return value;
  }

  throw new Error('Invalid requirement config for getting initial country');
};

export default createIdDocMachine;
