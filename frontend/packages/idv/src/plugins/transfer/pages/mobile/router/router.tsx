import React, { useEffect } from 'react';

import useLogStateMachine from '../../../../../hooks/ui/use-log-state-machine';
import MobileProcessing from '../../../components/mobile-processing';
import useMobileMachine from '../../../hooks/mobile/use-mobile-machine';
import NewTabRequest from '../new-tab-request';
import Sms from '../sms';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state] = useMobileMachine();
  const isDone = state.matches('complete');
  useLogStateMachine('transfer-mobile', state);

  useEffect(() => {
    if (isDone) {
      onDone();
    }
  }, [isDone, onDone]);

  return (
    <>
      {state.matches('newTabRequest') && <NewTabRequest />}
      {state.matches('newTabProcessing') && (
        <MobileProcessing translationKey="transfer.pages.mobile.new-tab-processing" />
      )}
      {state.matches('sms') && <Sms />}
      {state.matches('smsProcessing') && (
        <MobileProcessing translationKey="transfer.pages.mobile.sms-processing" />
      )}
    </>
  );
};

export default Router;
