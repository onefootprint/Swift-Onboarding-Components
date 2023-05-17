import { useLogStateMachine } from '@onefootprint/dev-tools';
import React, { useEffect } from 'react';

import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';
import BasicInformation from '../basic-information';
import Confirm from '../confirm';
import EditAddressDesktop from '../edit-address-desktop';
import EditBasicInfoDesktop from '../edit-basic-info-desktop';
import EditEmailDesktop from '../edit-email-desktop';
import EditIdentityDesktop from '../edit-identity-desktop';
import Email from '../email';
import Init from '../init';
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
  if (state.matches('ssn')) {
    return <Ssn />;
  }
  if (state.matches('confirm')) {
    return <Confirm />;
  }
  if (state.matches('emailEditDesktop')) {
    return <EditEmailDesktop />;
  }
  if (state.matches('basicInfoEditDesktop')) {
    return <EditBasicInfoDesktop />;
  }
  if (state.matches('addressEditDesktop')) {
    return <EditAddressDesktop />;
  }
  if (state.matches('identityEditDesktop')) {
    return <EditIdentityDesktop />;
  }

  return null;
};

export default Router;
