import { createMachine } from 'xstate';

import type { MachineEvents } from './types';

export const createPasskeysMachine = () =>
  createMachine({
    predictableActionArguments: true,
    id: 'passkeys',
    schema: {
      events: {} as MachineEvents,
    },
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    tsTypes: {} as import('./machine.typegen').Typegen0,
    initial: 'emailIdentification',
    context: {},
    states: {
      emailIdentification: {
        on: {
          proceedToNext: 'phoneIdentification',
        },
      },
      phoneIdentification: {
        on: {
          proceedToNext: 'smsChallenge',
        },
      },
      smsChallenge: {
        on: {
          proceedToNext: 'basicInformation',
        },
      },
      basicInformation: {
        on: {
          proceedToNext: 'residentialAddress',
        },
      },
      residentialAddress: {
        on: {
          proceedToNext: 'ssn',
        },
      },
      ssn: {
        on: {
          proceedToNext: 'final',
        },
      },
      final: {},
    },
  });

export default createPasskeysMachine;
