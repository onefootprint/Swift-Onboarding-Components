import { BeneficialOwnerDataAttribute, BusinessDI, CollectedKybDataOption, IdDI } from '@onefootprint/types';
import React from 'react';

import CollectKycData from '../../../collect-kyc-data';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';

const BeneficialOwnerKyc = () => {
  const [state, send] = useCollectKybDataMachine();
  const {
    kybRequirement: { missingAttributes },
    kycRequirement,
    kycUserData,
    data,
    idvContext,
    config,
  } = state.context;
  if (!config || !kycRequirement) {
    throw new Error('Missing collect-kyc-data props in kyb');
  }

  const handleDone = () => {
    send({
      type: 'beneficialOwnerKycSubmitted',
    });
  };

  const requireMultiKyc = missingAttributes.includes(CollectedKybDataOption.kycedBeneficialOwners);
  const primaryBeneficialOwner = requireMultiKyc
    ? data?.[BusinessDI.kycedBeneficialOwners]?.[0]
    : data?.[BusinessDI.beneficialOwners]?.[0];
  const userData = { ...kycUserData };
  if (primaryBeneficialOwner) {
    const userDatum = (value?: string) =>
      value
        ? {
            value,
            isBootstrap: false,
          }
        : undefined;
    userData[IdDI.firstName] = userDatum(primaryBeneficialOwner[BeneficialOwnerDataAttribute.firstName]);
    userData[IdDI.middleName] = userDatum(primaryBeneficialOwner[BeneficialOwnerDataAttribute.middleName]);
    userData[IdDI.lastName] = userDatum(primaryBeneficialOwner[BeneficialOwnerDataAttribute.lastName]);
  }

  return (
    <CollectKycData
      idvContext={idvContext}
      context={{
        disabledFields: [IdDI.firstName, IdDI.middleName, IdDI.lastName],
        userData,
        requirement: kycRequirement,
        config,
      }}
      onDone={handleDone}
    />
  );
};

export default BeneficialOwnerKyc;
