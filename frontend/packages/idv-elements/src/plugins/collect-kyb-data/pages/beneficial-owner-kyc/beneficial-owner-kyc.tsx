import {
  BeneficialOwnerDataAttribute,
  BusinessDI,
  CollectedKybDataOption,
  IdDI,
  IdDIData,
} from '@onefootprint/types';
import React from 'react';

import CollectKycData from '../../../collect-kyc-data';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';

const BeneficialOwnerKyc = () => {
  const [state, send] = useCollectKybDataMachine();
  const {
    kybRequirement: { missingAttributes },
    kycRequirement,
    kycBootstrapData,
    data,
    authToken,
    device,
    config,
    userFound,
    sandboxSuffix,
  } = state.context;
  if (!authToken || !device || !config || !kycRequirement) {
    throw new Error('Missing collect-kyc-data props in kyb');
  }

  const handleDone = () => {
    send({
      type: 'beneficialOwnerKycSubmitted',
    });
  };

  const requireMultiKyc = missingAttributes.includes(
    CollectedKybDataOption.kycedBeneficialOwners,
  );
  const primaryBeneficialOwner = requireMultiKyc
    ? data?.[BusinessDI.kycedBeneficialOwners]?.[0]
    : data?.[BusinessDI.beneficialOwners]?.[0];
  const bootstrapData: IdDIData = kycBootstrapData
    ? { ...kycBootstrapData }
    : {};
  if (primaryBeneficialOwner) {
    bootstrapData[IdDI.firstName] =
      primaryBeneficialOwner[BeneficialOwnerDataAttribute.firstName];
    bootstrapData[IdDI.lastName] =
      primaryBeneficialOwner[BeneficialOwnerDataAttribute.lastName];
  }

  return (
    <CollectKycData
      context={{
        authToken,
        device,
        customData: {
          disabledFields: [IdDI.firstName, IdDI.lastName],
          bootstrapData,
          requirement: kycRequirement,
          userFound: !!userFound,
          config,
          sandboxSuffix,
        },
      }}
      onDone={handleDone}
    />
  );
};

export default BeneficialOwnerKyc;
