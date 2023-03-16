import {
  BeneficialOwnerDataAttribute,
  BusinessDataAttribute,
  UserDataAttribute,
} from '@onefootprint/types';
import React from 'react';

<<<<<<< Updated upstream
import { CollectKycData } from '../../..';
=======
import CollectKycData from '../../../collect-kyc-data';
>>>>>>> Stashed changes
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';

const BeneficialOwnerKyc = () => {
  const [state, send] = useCollectKybDataMachine();
  const {
    missingKycAttributes,
    data,
    authToken,
    device,
    config,
    userFound,
    email,
  } = state.context;
  if (!authToken || !device || !config) {
    throw new Error('Missing collect-kyc-data props in kyb');
  }

  const handleDone = () => {
    send({
      type: 'beneficialOwnerKycSubmitted',
    });
  };

  const primaryBeneficialOwner =
    data?.[BusinessDataAttribute.beneficialOwners]?.[0];
  const fixedData = primaryBeneficialOwner
    ? {
        [UserDataAttribute.firstName]:
          primaryBeneficialOwner[BeneficialOwnerDataAttribute.firstName],
        [UserDataAttribute.lastName]:
          primaryBeneficialOwner[BeneficialOwnerDataAttribute.lastName],
      }
    : undefined;

  return (
    <CollectKycData
      context={{
        authToken,
        device,
        customData: {
          fixedData,
          missingAttributes: missingKycAttributes,
          userFound: !!userFound,
          email,
          config,
        },
      }}
      onDone={handleDone}
    />
  );
};

export default BeneficialOwnerKyc;
