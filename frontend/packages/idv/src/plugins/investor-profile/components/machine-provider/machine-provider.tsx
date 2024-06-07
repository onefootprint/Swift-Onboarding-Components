import { useMachine } from '@xstate/react';
import constate from 'constate';

import type { CreateInvestorProfileArgs } from '../../utils/state-machine/machine';
import investorProfileMachine from '../../utils/state-machine/machine';

const useLocalInvestorProfileMachine = ({
  args,
}: {
  args: CreateInvestorProfileArgs;
}) => useMachine(() => investorProfileMachine(args));

export const [MachineProvider, useInvestorProfileMachine] = constate(useLocalInvestorProfileMachine);

export default MachineProvider;
