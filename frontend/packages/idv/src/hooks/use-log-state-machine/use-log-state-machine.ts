import { useEffect } from 'react';
import type { State } from 'xstate';

import { Logger } from '@/idv/utils';

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const useLogStateMachine = (name: string, state: any) => {
  useEffect(() => {
    // For now, only log the state value, the actions and whether done to prevent leaking PII.
    // We might expand this later
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const stateData = (state as State<any, any>).toJSON();
    Logger.track(`${stateData.done ? '(done)' : '(pending)'} ${name} ${state.value}`, {
      name,
      value: state.value,
      done: Boolean(stateData.done),
    });
  }, [state.value, state.done]);
};

export default useLogStateMachine;
