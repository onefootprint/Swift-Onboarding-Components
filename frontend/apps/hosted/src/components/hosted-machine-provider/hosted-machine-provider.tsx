import { useMachine } from '@xstate/react';
import constate from 'constate';

import { HostedMachine } from '../../utils/state-machine';

const useLocalHostedMachine = () => useMachine(HostedMachine);

export const [HostedMachineProvider, useHostedMachine] = constate(useLocalHostedMachine);

export default HostedMachineProvider;
