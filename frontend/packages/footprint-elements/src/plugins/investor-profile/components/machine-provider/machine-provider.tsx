import { useMachine } from '@xstate/react';
import constate from 'constate';

import investorProfileMachine from '../../utils/state-machine/machine';

const useLocalInvestorProfileMachine = () => useMachine(investorProfileMachine);

export const [MachineProvider, useInvestorProfileMachine] = constate(
  useLocalInvestorProfileMachine,
);

export default MachineProvider;
