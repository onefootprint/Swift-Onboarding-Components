import type { UserChallengeActionKind } from '@onefootprint/types';
import { useEffect } from 'react';

import { useLogStateMachine } from '../../../../hooks';
import { trackAction } from '../../../../utils/logger';
import { getLogger } from '../../../../utils/logger';
import useLivenessMachine from '../../hooks/use-liveness-machine';
import Register from '../register';
import Unavailable from '../unavailable';

const { logInfo } = getLogger({ location: 'passkeys-router' });

type RouterProps = {
  actionKind: UserChallengeActionKind;
  onCustomSkip?: () => void;
  onDone: () => void;
};

const Router = ({ actionKind, onCustomSkip, onDone }: RouterProps) => {
  const [state] = useLivenessMachine();
  const isDone = state.matches('completed');
  useLogStateMachine('passkeys', state);

  useEffect(() => {
    logInfo('Passkeys router started');
    trackAction('passkeys:started');
  }, []);

  useEffect(() => {
    if (isDone) {
      logInfo('Passkeys requirement completed');
      trackAction('passkeys:completed');
      onDone();
    }
  }, [isDone, onDone]);

  if (state.matches('register')) {
    return <Register actionKind={actionKind} onCustomSkip={onCustomSkip} />;
  }
  if (state.matches('unavailable')) {
    return <Unavailable />;
  }
  return null;
};

export default Router;
