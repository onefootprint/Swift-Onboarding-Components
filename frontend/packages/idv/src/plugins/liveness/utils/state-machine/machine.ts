import { createMachine } from 'xstate';

import type { MachineContext, MachineEvents } from './types';

export const createLivenessMachine = (initialContext: MachineContext) =>
  createMachine({
    predictableActionArguments: true,
    id: 'liveness',
    schema: {
      context: {} as MachineContext,
      events: {} as MachineEvents,
    },
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    tsTypes: {} as import('./machine.typegen').Typegen0,
    initial: 'init',
    context: { ...initialContext },
    states: {
      init: {
        always: [
          {
            target: 'register',
            cond: ctx => {
              const {
                idvContext: {
                  isInIframe,
                  device: { hasSupportForWebauthn },
                },
              } = ctx;
              return !isInIframe && !!hasSupportForWebauthn;
            },
          },
          {
            target: 'unavailable',
          },
        ],
      },
      register: {
        on: {
          skipped: {
            target: 'completed',
          },
          succeeded: {
            target: 'completed',
          },
        },
      },
      unavailable: {
        on: {
          completed: {
            target: 'completed',
          },
        },
      },
      completed: {
        type: 'final',
      },
    },
  });

export default createLivenessMachine;
