import { useLogStateMachine } from '@onefootprint/dev-tools';
import React, { useEffect } from 'react';

import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';
import { States } from '../../utils/state-machine/types';
import BasicInformation from '../basic-information';
import Confirm from '../confirm';
import EditAddressDesktop from '../edit-address-desktop';
import EditBasicInfoDesktop from '../edit-basic-info-desktop';
import EditEmailDesktop from '../edit-email-desktop';
import EditIdentityDesktop from '../edit-identity-desktop';
import Email from '../email';
import Address from '../residential-address';
import Ssn from '../ssn';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state] = useCollectKycDataMachine();
  const isDone = state.matches(States.completed);
  useLogStateMachine('collect-kyc-data', state);

  useEffect(() => {
    if (isDone) {
      onDone();
    }
  }, [isDone, onDone]);

  if (state.matches(States.email)) {
    return <Email />;
  }
  if (state.matches(States.basicInformation)) {
    return <BasicInformation />;
  }
  if (state.matches(States.residentialAddress)) {
    return <Address />;
  }
  if (state.matches(States.ssn)) {
    return <Ssn />;
  }
  if (state.matches(States.confirm)) {
    return <Confirm />;
  }
  if (state.matches(States.emailEditDesktop)) {
    return <EditEmailDesktop />;
  }
  if (state.matches(States.basicInfoEditDesktop)) {
    return <EditBasicInfoDesktop />;
  }
  if (state.matches(States.addressEditDesktop)) {
    return <EditAddressDesktop />;
  }
  if (state.matches(States.identityEditDesktop)) {
    return <EditIdentityDesktop />;
  }

  return null;
};

export default Router;
