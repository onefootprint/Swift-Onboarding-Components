import { BootstrapData } from 'src/idv.types';
import { assign, createMachine } from 'xstate';

import { MachineContext, MachineEvents } from './types';

export type IdvMachineArgs = {
  tenantPk: string;
  bootstrapData?: BootstrapData;
};

/*
  TODO: implement + test
*/
const createIdvMachine = ({ tenantPk, bootstrapData }: IdvMachineArgs) =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'idv',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'init',
      context: {
        tenantPk,
        bootstrapData,
      },
      on: {
        reset: {
          target: 'init',
          actions: ['resetContext'],
        },
      },
      states: {
        init: {},
      },
    },
    {
      actions: {
        resetContext: assign(context => ({
          tenantPk: context.tenantPk,
          bootstrapData: context.bootstrapData,
        })),
      },
    },
  );

export default createIdvMachine;
