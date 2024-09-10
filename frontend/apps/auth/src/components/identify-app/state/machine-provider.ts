import { useMachine } from '@xstate/react';
import constate from 'constate';

import createAuthIdentifyAppMachine from './machine';
import type { AuthIdentifyAppMachineArgs } from './types';

export const [AuthIdentifyAppMachineProvider, useAuthIdentifyAppMachine] = constate(
  ({ args }: { args: AuthIdentifyAppMachineArgs }) => useMachine(() => createAuthIdentifyAppMachine(args)),
);

export type AuthIdentifyAppMachineHook = ReturnType<typeof useAuthIdentifyAppMachine>;
