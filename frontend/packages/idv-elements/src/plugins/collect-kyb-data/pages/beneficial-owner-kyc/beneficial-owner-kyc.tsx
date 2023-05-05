import {
  BeneficialOwnerDataAttribute,
  BusinessDI,
  CollectedKybDataOption,
  IdDI,
} from '@onefootprint/types';
import React from 'react';

import CollectKycData from '../../../collect-kyc-data';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';

const BeneficialOwnerKyc = () => {
  const [state, send] = useCollectKybDataMachine();
  const {
    missingKybAttributes,
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

  const requireMultiKyc = missingKybAttributes.includes(
    CollectedKybDataOption.kycedBeneficialOwners,
  );
  const primaryBeneficialOwner = requireMultiKyc
    ? data?.[BusinessDI.kycedBeneficialOwners]?.[0]
    : data?.[BusinessDI.beneficialOwners]?.[0];
  const fixedData = primaryBeneficialOwner
    ? {
        [IdDI.firstName]:
          primaryBeneficialOwner[BeneficialOwnerDataAttribute.firstName],
        [IdDI.lastName]:
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
