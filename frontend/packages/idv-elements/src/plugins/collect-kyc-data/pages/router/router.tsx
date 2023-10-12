import React, { useEffect } from 'react';

import useLogStateMachine from '../../../../hooks/ui/use-log-state-machine';
import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';
import BasicInformation from '../basic-information';
import Confirm from '../confirm';
import Email from '../email';
import Init from '../init';
import LegalStatus from '../legal-status';
import Address from '../residential-address';
import Ssn from '../ssn';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state] = useCollectKycDataMachine();
  const isDone = state.matches('completed');
  useLogStateMachine('collect-kyc-data', state);

  useEffect(() => {
    if (isDone) {
      onDone();
    }
  }, [isDone, onDone]);

  if (state.matches('init')) {
    return <Init />;
  }
  if (state.matches('email')) {
    return <Email />;
  }
  if (state.matches('basicInformation')) {
    return <BasicInformation />;
  }
  if (state.matches('residentialAddress')) {
    return <Address />;
  }
  if (state.matches('usLegalStatus')) {
    return <LegalStatus />;
  }
  if (state.matches('ssn')) {
    return <Ssn />;
  }
  if (state.matches('confirm')) {
    return <Confirm />;
  }

  return null;
};

export default Router;
