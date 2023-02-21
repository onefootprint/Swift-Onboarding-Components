import { Event, State } from '../../../../../../../utils/decrypt-state-machine';
import { useDecryptMachine } from '../../../../../../decrypt-machine-provider';

const useDecryptControls = () => {
  const [state, send] = useDecryptMachine();
  const isOpen =
    state.matches(State.confirmingReason) || state.matches(State.decrypting);
  const isIdle = state.matches(State.idle);
  const isLoading = state.matches(State.decrypting);
  const inProgress =
    state.matches(State.selectingFields) ||
    state.matches(State.confirmingReason) ||
    state.matches(State.decrypting);

  const start = () => {
    send(Event.started);
  };

  const cancel = () => {
    send(Event.canceled);
  };

  return {
    start,
    cancel,
    isOpen,
    isIdle,
    isLoading,
    inProgress,
  };
};

export default useDecryptControls;
