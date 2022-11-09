import { useActor } from '@xstate/react';
import constate from 'constate';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import {
  MachineContext,
  MachineEvents,
} from 'src/utils/state-machine/identify/types';
import { Sender, State } from 'xstate';

const useLocalIdentifyMachine = () => {
  const [state] = useBifrostMachine();
  const actor: [State<MachineContext>, Sender<MachineEvents>] = useActor(
    state.children.identify,
  );
  return actor;
};

export const [IdentifyMachineProvider, useIdentifyMachine] = constate(
  useLocalIdentifyMachine,
);

export default IdentifyMachineProvider;
