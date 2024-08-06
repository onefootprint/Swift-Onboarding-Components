import { BeneficialOwnerDataAttribute, BusinessDI, CollectedKybDataOption, IdDI } from '@onefootprint/types';

import CollectKycData from '../../../collect-kyc-data';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';

const toDImetadata = (value?: string) => (value ? { value, isBootstrap: false } : undefined);

const BeneficialOwnerKyc = () => {
  const [state, send] = useCollectKybDataMachine();
  const {
    bootstrapUserData,
    config,
    data,
    idvContext,
    kybRequirement: { missingAttributes },
    kycRequirement,
  } = state.context;
  if (!config || !kycRequirement) {
    throw new Error('Missing collect-kyc-data props in kyb');
  }

  const handleDone = () => {
    send({ type: 'beneficialOwnerKycSubmitted' });
  };

  const requireMultiKyc = missingAttributes.includes(CollectedKybDataOption.kycedBeneficialOwners);
  const primaryBeneficialOwner = requireMultiKyc
    ? data?.[BusinessDI.kycedBeneficialOwners]?.[0]
    : data?.[BusinessDI.beneficialOwners]?.[0];
  const kycUserData = { ...bootstrapUserData };

  if (primaryBeneficialOwner) {
    kycUserData[IdDI.firstName] = toDImetadata(primaryBeneficialOwner[BeneficialOwnerDataAttribute.firstName]);
    kycUserData[IdDI.middleName] = toDImetadata(primaryBeneficialOwner[BeneficialOwnerDataAttribute.middleName]);
    kycUserData[IdDI.lastName] = toDImetadata(primaryBeneficialOwner[BeneficialOwnerDataAttribute.lastName]);
  }

  return (
    <CollectKycData
      idvContext={idvContext}
      context={{
        disabledFields: [IdDI.firstName, IdDI.middleName, IdDI.lastName],
        bootstrapUserData: kycUserData,
        requirement: kycRequirement,
        config,
      }}
      onDone={handleDone}
    />
  );
};

export default BeneficialOwnerKyc;
