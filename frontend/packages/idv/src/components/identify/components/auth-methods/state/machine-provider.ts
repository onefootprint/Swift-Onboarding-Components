import { useMachine } from '@xstate/react';
import constate from 'constate';

import type { AuthMethodsMachineArgs } from './machine';
import createAuthMethodsMachine from './machine';
import type { Typegen0 } from './machine.typegen';

type WithArgs = { args: AuthMethodsMachineArgs };

export const [AuthMethodsMachineProvider, useAuthMethodsMachine] = constate(({ args }: WithArgs) =>
  useMachine(() => createAuthMethodsMachine(args)),
);

export type AuthMethodsMachineHook = ReturnType<typeof useAuthMethodsMachine>;
export type AuthMethodsMachineState = Typegen0['matchesStates'];
