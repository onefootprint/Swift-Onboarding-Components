import { useFlags } from 'launchdarkly-react-client-sdk';
import React, { useEffect } from 'react';

import useLogStateMachine from '../../../../hooks/ui/use-log-state-machine';
import { useOnboardingMachine } from '../../components/machine-provider';
import Requirements from '../requirements';
import Validate from '../validate';

export type DonePayload = {
  validationToken?: string;
};

type RouterProps = {
  onDone: (payload: DonePayload) => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state, send] = useOnboardingMachine();
  useLogStateMachine('onboarding', state);
  const { config, idvContext, bootstrapData, overallOutcome, validationToken, idDocOutcome } = state.context;
  const { IdvTransferFromDesktopDisabled } = useFlags();
  const orgIds = new Set<string>(IdvTransferFromDesktopDisabled);
  const isTransferOnDesktopDisabled = orgIds.has(config.orgId);

  const isDone = state.matches('complete');
  useEffect(() => {
    if (isDone) {
      // Will enter this with either a null validationToken (in the transfer app) or with a
      // validationToken after validate
      onDone({ validationToken });
    }
  }, [isDone, onDone, validationToken]);

  return (
    <>
      {state.matches('requirements') && (
        <Requirements
          config={config}
          idvContext={idvContext}
          bootstrapData={bootstrapData}
          overallOutcome={overallOutcome}
          idDocOutcome={idDocOutcome}
          onDone={() => send({ type: 'requirementsCompleted' })}
          isTransferOnDesktopDisabled={isTransferOnDesktopDisabled}
        />
      )}
      {state.matches('validate') && <Validate />}
    </>
  );
};

export default Router;
