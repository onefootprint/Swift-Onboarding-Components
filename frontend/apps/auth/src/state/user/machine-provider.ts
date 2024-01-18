import { useMachine } from '@xstate/react';
import constate from 'constate';

import type { UserMachineArgs } from './machine';
import createUserMachine from './machine';

export const [UserMachineProvider, useUserMachine] = constate(
  ({ args }: { args: UserMachineArgs }) =>
    useMachine(() => createUserMachine(args)),
);

export type UserMachineHook = ReturnType<typeof useUserMachine>;
