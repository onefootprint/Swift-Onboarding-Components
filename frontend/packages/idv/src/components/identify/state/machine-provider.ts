import { useMachine } from '@xstate/react';
import constate from 'constate';

import createIdentifyMachine from './machine';
import type { IdentifyMachineArgs } from './types';

export const [IdentifyMachineProvider, useIdentifyMachine] = constate(({ args }: { args: IdentifyMachineArgs }) =>
  useMachine(() => createIdentifyMachine(args)),
);

export type IdentifyMachineHook = ReturnType<typeof useIdentifyMachine>;
