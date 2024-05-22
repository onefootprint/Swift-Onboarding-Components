import { useEffect } from 'react';
import type { State } from 'xstate';

import { Logger } from '../../../utils/logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useLogStateMachine = (name: string, state: any) => {
  useEffect(() => {
    // For now, only log the state value, the actions and whether done to prevent leaking PII.
    // We might expand this later
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stateData = (state as State<any, any>).toJSON();
    Logger.track(
      `machine ${name}:${state.value} done:${Boolean(stateData.done)}`,
      {
        name,
        value: state.value,
        done: Boolean(stateData.done),
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.value, state.done]);
};

export default useLogStateMachine;
