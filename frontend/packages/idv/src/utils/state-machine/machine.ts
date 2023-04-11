import { BootstrapData } from 'src/idv.types';
import { createMachine } from 'xstate';

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
      states: {
        init: {},
      },
    },
    {
      actions: {},
    },
  );

export default createIdvMachine;
