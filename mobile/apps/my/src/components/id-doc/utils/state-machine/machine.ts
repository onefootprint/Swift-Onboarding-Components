import { SubmitDocumentSide } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import { MachineContext, MachineEvents } from './types';

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
        currentSide: SubmitDocumentSide.Front,
        collectingDocumentMeta: {
          countryCode: null,
          type: null,
        },
        ...initialContext,
      },
      initial: 'docSelection',
      states: {
        docSelection: {
          on: {
            countryAndTypeSubmitted: {
              target: 'frontImage',
              actions: 'assignCountryAndType',
            },
          },
        },
        frontImage: {
          on: {
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
        assignCountryAndType: assign((context, { payload }) => {
          return {
            ...context,
            collectingDocumentMeta: {
              countryCode: payload.countryCode,
              type: payload.documentType,
            },
          };
        }),
      },
    },
  );

export default createIdDocMachine;
