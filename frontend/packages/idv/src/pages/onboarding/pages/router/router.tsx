import { useFlags } from 'launchdarkly-react-client-sdk';
import { useEffect } from 'react';

import { useLogStateMachine } from '../../../../hooks';
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

  // Initially, the flag was created to completely skip transfer plugin
  // However, since then, we added "open new tab" page to the transfer plugin
  // which does passkey on desktop iframe
  // So, we don't to completely skip the transfer plugin
  // Instead we just want to skip the transfer from desktop to mobile
  const isTransferFromDesktopToMobileDisabled = orgIds.has(config.orgId);

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
          isTransferFromDesktopToMobileDisabled={isTransferFromDesktopToMobileDisabled}
        />
      )}
      {state.matches('validate') && <Validate />}
    </>
  );
};

export default Router;
