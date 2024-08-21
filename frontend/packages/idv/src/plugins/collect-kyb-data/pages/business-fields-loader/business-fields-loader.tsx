import { type BusinessDIData, CollectedKybDataOption, type DecryptUserResponse } from '@onefootprint/types';
import type React from 'react';
import useEffectOnceStrict from '../../../../components/identify/hooks/use-effect-once-strict';
import { useDecryptBusiness, useDecryptUser } from '../../../../queries';
import type { UserData } from '../../../../types';
import { isObject, isStringValid } from '../../../../utils';
import { BeneficialOwnerIdFields, BusinessFields } from '../../utils/constants';
import { buildBeneficialOwner, getBoDi, omitNullAndUndefined } from '../../utils/utils';

type BusinessFieldsLoaderProps = {
  authToken?: string;
  bootstrapUserData?: UserData;
  children: React.ReactNode;
  missingAttributes?: CollectedKybDataOption[];
  onError: (error?: unknown) => void;
  onSuccess: (payload: { data: BusinessDIData; vaultBusinessData: BusinessDIData }) => void;
  populatedAttributes?: CollectedKybDataOption[];
};

const hasUserDataBootstrapped = (userData?: UserData | undefined): boolean =>
  isObject(userData) &&
  Object.keys(userData).length > 0 &&
  BeneficialOwnerIdFields.some(
    idKey => Boolean(userData?.[idKey]?.isBootstrap) && isStringValid(userData?.[idKey]?.value),
  );

const BusinessFieldsLoader = ({
  authToken,
  bootstrapUserData,
  children,
  missingAttributes,
  onError,
  onSuccess,
  populatedAttributes,
}: BusinessFieldsLoaderProps) => {
  const mutDecryptBusiness = useDecryptBusiness();
  const mutDecryptUser = useDecryptUser();

  const fetchDecryptedData = (authToken: string): Promise<[BusinessDIData, DecryptUserResponse]> => {
    const decryptBusiness: Promise<BusinessDIData> = new Promise<BusinessDIData>((resolve, reject) => {
      mutDecryptBusiness.mutate({ authToken, fields: BusinessFields }, { onError: reject, onSuccess: resolve });
    });

    const decryptUser: Promise<DecryptUserResponse> = hasUserDataBootstrapped(bootstrapUserData)
      ? Promise.resolve({})
      : new Promise<DecryptUserResponse>((resolve, reject) => {
          mutDecryptUser.mutate(
            { authToken, fields: BeneficialOwnerIdFields },
            { onError: reject, onSuccess: resolve },
          );
        });

    return Promise.all([decryptBusiness, decryptUser]);
  };

  useEffectOnceStrict(() => {
    if (authToken) {
      fetchDecryptedData(authToken)
        .then(([businessData, userData]) => {
          const userCleanObj = omitNullAndUndefined(userData);
          const vaultBusinessData: Readonly<BusinessDIData> = omitNullAndUndefined(businessData);
          const payload = { ...vaultBusinessData };

          if (populatedAttributes?.includes(CollectedKybDataOption.tin)) {
            payload['business.tin'] = 'decrypted';
          }

          const allAttributes = (missingAttributes || []).concat(populatedAttributes || []);
          const boDi = getBoDi(allAttributes);
          const businessOwnerObj = boDi && !payload[boDi] ? buildBeneficialOwner(userCleanObj, boDi) : {};

          if (boDi && Object.keys(businessOwnerObj).length > 0) {
            payload[boDi] = [businessOwnerObj];
          }

          return onSuccess({
            data: payload,
            vaultBusinessData,
          });
        })
        .catch(onError);
    }
  });

  return children;
};

export default BusinessFieldsLoader;
