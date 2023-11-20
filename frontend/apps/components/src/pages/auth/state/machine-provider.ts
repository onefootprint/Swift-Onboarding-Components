import { useMachine } from '@xstate/react';
import constate from 'constate';

import type { AuthMachineArgs } from './machine';
import createAuthMachine from './machine';

export const [AuthMachineProvider, useAuthMachine] = constate(
  ({ args }: { args: AuthMachineArgs }) =>
    useMachine(() => createAuthMachine(args)),
);
