import { useLogStateMachine } from '@onefootprint/dev-tools';
import React, { useEffect } from 'react';

import { useCollectKybDataMachine } from '../../components/machine-provider';
import BasicData from '../basic-data';
import BeneficialOwnerKyc from '../beneficial-owner-kyc';
import BeneficialOwners from '../beneficial-owners';
import BusinessAddress from '../business-address';
import Confirm from '../confirm';
import Introduction from '../introduction';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state] = useCollectKybDataMachine();
  const isDone = state.matches('completed');
  useLogStateMachine('collect-kyb-data', state);

  useEffect(() => {
    if (isDone) {
      onDone();
    }
  }, [isDone, onDone]);

  if (state.matches('introduction')) {
    return <Introduction />;
  }
  if (state.matches('basicData')) {
    return <BasicData />;
  }
  if (state.matches('businessAddress')) {
    return <BusinessAddress />;
  }
  if (state.matches('beneficialOwners')) {
    return <BeneficialOwners />;
  }
  if (state.matches('confirm')) {
    return <Confirm />;
  }
  if (state.matches('beneficialOwnerKyc')) {
    return <BeneficialOwnerKyc />;
  }

  return null;
};

export default Router;
