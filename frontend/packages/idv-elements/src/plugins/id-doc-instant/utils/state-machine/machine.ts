import { assign, createMachine } from 'xstate';

import ImagesRequiredByIdDocType from '../../constants/images-required-by-id-doc-type';
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
      initial: 'countryAndType',
      context: { ...args },
      states: {
        countryAndType: {
          on: {
            receivedCountryAndType: {
              target: 'frontImage',
              actions: 'assignCountryAndType',
            },
          },
        },
        frontImage: {
          on: {
            receivedImage: [
              {
                target: 'backImage',
                cond: context =>
                  !!context.type &&
                  !!ImagesRequiredByIdDocType[context.type].back,
              },
              {
                target: 'success',
              },
            ],
          },
        },
        backImage: {
          on: {
            receivedImage: {
              target: 'success',
            },
          },
        },
        success: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        assignCountryAndType: assign((context, event) => ({
          ...context,
          type: event.payload.type,
          country: event.payload.country,
        })),
      },
    },
  );

export default createIdDocMachine;
