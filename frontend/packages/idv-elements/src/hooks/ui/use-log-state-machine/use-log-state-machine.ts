import { useObserveCollector } from '@onefootprint/dev-tools/src/hooks/use-observe-collector';
import { useEffect } from 'react';
import type { State } from 'xstate';

import Logger from '../../../utils/logger';

const useLogStateMachine = (name: string, state: any) => {
  const observeCollector = useObserveCollector();

  useEffect(() => {
    // For now, only log the state value, the actions and whether done to prevent leaking PII.
    // We might expand this later
    const stateData = (state as State<any, any>).toJSON();
    Logger.track(`${name}-${state.value}`, {
      name,
      value: state.value,
      done: !!stateData.done,
    });
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
