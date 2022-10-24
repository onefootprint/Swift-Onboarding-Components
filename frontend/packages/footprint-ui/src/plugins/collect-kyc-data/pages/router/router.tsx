import React, { useEffect } from 'react';

import { useCollectKycDataMachine } from '../../components/machine-provider';
import { States } from '../../utils/state-machine/types';
import BasicInformation from '../basic-information';
import Confirm from '../confirm';
import EditAddressDesktop from '../edit-address-desktop';
import EditBasicInfoDesktop from '../edit-basic-info-desktop';
import EditIdentityDesktop from '../edit-identity-desktop';
import Address from '../residential-address';
import Ssn from '../ssn';
import StartKyc from '../start-kyc';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state] = useCollectKycDataMachine();
  const isDone = state.matches(States.completed);

  useEffect(() => {
    if (isDone) {
      onDone();
    }
  }, [isDone, onDone]);

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
  if (state.matches(States.basicInfoEditDesktop)) {
    return <EditBasicInfoDesktop />;
  }
  if (state.matches(States.addressEditDesktop)) {
    return <EditAddressDesktop />;
  }
  if (state.matches(States.identityEditDesktop)) {
    return <EditIdentityDesktop />;
  }
  if (state.matches(States.startKyc)) {
    return <StartKyc />;
  }

  return null;
};

export default Router;
