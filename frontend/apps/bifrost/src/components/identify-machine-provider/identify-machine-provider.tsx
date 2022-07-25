import { useActor } from '@xstate/react';
import constate from 'constate';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import { MachineEvents } from 'src/utils/state-machine/identify/types';
import { Sender } from 'xstate';

const useLocalIdentifyMachine = () => {
  const [state] = useBifrostMachine();
  const actor: [any, Sender<MachineEvents>] = useActor(state.children.identify);
  return actor;
};

export const [IdentifyMachineProvider, useIdentifyMachine] = constate(
  useLocalIdentifyMachine,
);

export default IdentifyMachineProvider;
