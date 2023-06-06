import { assign, createMachine } from 'xstate';

import { MachineContext, MachineEvents } from './types';

const createIdDocMachine = (initialContext: MachineContext) =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'idDoc',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0,
      context: initialContext,
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
        frontImage: {},
        complete: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        assignCountryAndType: assign((context, event) => {
          context.collectingDocumentMeta = {
            countryCode: event.payload.countryCode,
            type: event.payload.documentType,
          };
          return context;
        }),
      },
    },
  );

export default createIdDocMachine;
