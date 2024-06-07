import { useMachine } from '@xstate/react';
import constate from 'constate';

import type { IdentifyMachineArgs } from './machine';
import createIdentifyMachine from './machine';

export const [IdentifyMachineProvider, useIdentifyMachine] = constate(({ args }: { args: IdentifyMachineArgs }) =>
  useMachine(() => createIdentifyMachine(args)),
);

export type IdentifyMachineHook = ReturnType<typeof useIdentifyMachine>;
