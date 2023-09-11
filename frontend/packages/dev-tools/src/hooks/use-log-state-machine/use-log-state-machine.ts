import { useEffect } from 'react';
import type { State } from 'xstate';

import { useObserveCollector } from '../use-observe-collector';

const useLogStateMachine = (name: string, state: any) => {
  const observeCollector = useObserveCollector();

  useEffect(() => {
    // For now, only log the state value, the actions and whether done to prevent leaking PII.
    // We might expand this later
    const stateData = (state as State<any, any>).toJSON();
    observeCollector.log('state-machine', {
      name,
      state: {
        value: state.value,
        actions: stateData.actions,
        done: stateData.done,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.value, state.done]);
};

export default useLogStateMachine;
