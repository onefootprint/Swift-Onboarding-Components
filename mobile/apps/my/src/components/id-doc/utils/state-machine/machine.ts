import { assign, createMachine } from 'xstate';

import { DocSide } from '../../id-doc.types';
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
        currentStep: {
          image: undefined,
          errors: [],
          side: DocSide.Front,
        },
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
            imageSubmitted: {
              target: 'processing',
            },
          },
        },
        processing: {},
        complete: {
          type: 'final',
        },
      },
    },
    {
      actions: {
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
