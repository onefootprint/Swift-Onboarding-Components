import { IdDI } from '@onefootprint/types';

import { useBusinessOwners } from '../../../../queries';
import CollectKycData from '../../../collect-kyc-data';
import Loading from '../../components/loading';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';

const toDImetadata = (value?: string) => (value ? { value, isBootstrap: false } : undefined);

const BeneficialOwnerKyc = () => {
  const [state, send] = useCollectKybDataMachine();
  const { bootstrapUserData, config, idvContext, kycRequirement } = state.context;
  const bosQuery = useBusinessOwners({ authToken: idvContext.authToken });

  if (!config || !kycRequirement) {
    throw new Error('Missing collect-kyc-data props in kyb');
  }

  const handleDone = () => {
    send({ type: 'beneficialOwnerKycSubmitted' });
  };

  if (bosQuery.isPending || bosQuery.isFetching) {
    return <Loading />;
  }

  const primaryBo = bosQuery.data?.find(bo => bo.isAuthedUser);
  const kycUserData = { ...bootstrapUserData };
  if (primaryBo) {
    kycUserData[IdDI.firstName] = toDImetadata(primaryBo.decryptedData[IdDI.firstName]);
    kycUserData[IdDI.lastName] = toDImetadata(primaryBo.decryptedData[IdDI.lastName]);
  }

  return (
    <CollectKycData
      idvContext={idvContext}
      context={{
        bootstrapUserData: kycUserData,
        requirement: kycRequirement,
        config,
      }}
      onDone={handleDone}
    />
  );
};

export default BeneficialOwnerKyc;
