import { type BusinessDIData, CollectedKybDataOption, type DecryptUserResponse } from '@onefootprint/types';
import type React from 'react';
import useEffectOnceStrict from '../../../../components/identify/hooks/use-effect-once-strict';
import { useDecryptBusiness, useDecryptUser } from '../../../../queries';
import type { UserData } from '../../../../types';
import { isObject, isStringValid } from '../../../../utils';
import { useCollectKybDataMachine } from '../../components/machine-provider';
import { computeBosValue } from '../../utils/attributes/attributes';
import { BeneficialOwnerIdFields, BusinessFields } from '../../utils/constants';
import { omitNullAndUndefined } from '../../utils/utils';

type BusinessFieldsLoaderProps = {
  children: React.ReactNode;
  onError: (error?: unknown) => void;
  onSuccess: (payload: { data: BusinessDIData; vaultBusinessData: BusinessDIData }) => void;
};

const hasUserDataBootstrapped = (userData?: UserData | undefined): boolean =>
  isObject(userData) &&
  Object.keys(userData).length > 0 &&
  BeneficialOwnerIdFields.some(
    idKey => Boolean(userData?.[idKey]?.isBootstrap) && isStringValid(userData?.[idKey]?.value),
  );

const BusinessFieldsLoader = ({ children, onError, onSuccess }: BusinessFieldsLoaderProps) => {
  const mutDecryptBusiness = useDecryptBusiness();
  const mutDecryptUser = useDecryptUser();
  const [state, _] = useCollectKybDataMachine();
  const {
    idvContext: { authToken },
    bootstrapUserData,
    bootstrapBusinessData,
    kybRequirement,
  } = state.context;

  const fetchDecryptedData = (authToken: string): Promise<[BusinessDIData, DecryptUserResponse | undefined]> => {
    const decryptBusiness: Promise<BusinessDIData> = new Promise<BusinessDIData>((resolve, reject) => {
      mutDecryptBusiness.mutate({ authToken, fields: BusinessFields }, { onError: reject, onSuccess: resolve });
    });

    // TODO this is incorrect - we could have bootstrapped user data AND existing user data.
    // We should overlay the bootstrap data on top of the existing data
    const decryptUser: Promise<DecryptUserResponse | undefined> = hasUserDataBootstrapped(bootstrapUserData)
      ? Promise.resolve(undefined)
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
          const vaultBusinessData: Readonly<BusinessDIData> = omitNullAndUndefined(businessData);
          let payload = {
            ...vaultBusinessData,
          };

          if (!!userData && !payload['business.beneficial_owners'] && !payload['business.kyced_beneficial_owners']) {
            // If we decrypted user data from the backend (because there's no bootstrap data) and if the business
            // doesn't already have beneficial owners, prepopulate this.
            // TODO the user data decryption might be easier to do in `beneficial-owners.tsx`, this is a little complex
            const userCleanObj = omitNullAndUndefined(userData);
            const bosPopulatedFromUserData = computeBosValue(kybRequirement, userCleanObj, bootstrapBusinessData);
            payload = {
              ...payload,
              ...bosPopulatedFromUserData,
            };
          }

          if (kybRequirement.populatedAttributes?.includes(CollectedKybDataOption.tin)) {
            payload['business.tin'] = 'scrubbed';
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
