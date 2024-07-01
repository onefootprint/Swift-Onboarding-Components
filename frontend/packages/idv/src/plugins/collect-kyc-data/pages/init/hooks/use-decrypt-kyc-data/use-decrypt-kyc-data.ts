import { getErrorMessage } from '@onefootprint/request';
import { CollectedKycDataOption } from '@onefootprint/types';
import type { UserTokenResponse } from '@onefootprint/types';
import { CdoToAllDisMap, IdDI, UserTokenScope } from '@onefootprint/types';

import useUserToken from '../../../../../../hooks/api/hosted/user/use-user-token';
import { Logger } from '../../../../../../utils/logger';
import useDecryptUser from '../../../../hooks/use-decrypt-user';
import type { KycData } from '../../../../utils/data-types';

// These fields are decryptable with any auth token. Other fields are only decryptable if authed
// with biometric
const SENSITIVE_DIS: IdDI[] = [IdDI.email, IdDI.phoneNumber, IdDI.ssn4, IdDI.ssn9, IdDI.itin, IdDI.usTaxId];
const BASIC_PROFILE_DIS: IdDI[] = [...Object.values(IdDI)].filter(di => !SENSITIVE_DIS.includes(di));

type UseDecryptKycDataArgs = {
  authToken: string;
  populatedCdos: CollectedKycDataOption[];
  onSuccess: (data: KycData) => void;
  onError: (error: unknown) => void;
};

const useDecryptKycData = ({ authToken, populatedCdos, onSuccess, onError }: UseDecryptKycDataArgs) => {
  const decryptUserMutation = useDecryptUser();
  const populatedDis = populatedCdos.flatMap(cdo => CdoToAllDisMap[cdo]) as IdDI[];

  const handleDecryptedData = (decryptedData: Partial<Record<IdDI, string | string[] | undefined>>) => {
    const data: KycData = {};

    // Create scrubbed entries for populated attributes that weren't decrypted - this allows us
    // to skip collection of them and display a scrubbed value showing that they already exist
    populatedDis.forEach(di => {
      data[di] = {
        decrypted: false,
        scrubbed: true,
      };
    });

    // Add the decrypted values if available
    Object.entries(decryptedData).forEach(([di, value]) => {
      if (value) {
        data[di as IdDI] = {
          // @ts-expect-error: fix-me Type 'string | string[]' is not assignable to type 'undefined'.
          value,
          decrypted: true,
          scrubbed: false,
        };
      }
    });

    onSuccess(data);
  };

  const handleTokenSuccess = (response: UserTokenResponse) => {
    const { scopes } = response;
    const canDecryptBasic = scopes.includes(UserTokenScope.signup) || scopes.includes(UserTokenScope.basicProfile);
    const canDecryptSensitive = scopes.includes(UserTokenScope.sensitiveProfile);

    let fields: IdDI[] = populatedDis;
    if (!canDecryptSensitive) {
      fields = fields.filter(di => BASIC_PROFILE_DIS.includes(di));
    }

    // If can't decrypt or there is nothing to decrypt, return empty data
    if (fields.length === 0 || (!canDecryptBasic && !canDecryptSensitive)) {
      handleDecryptedData({});
      return;
    }

    if (decryptUserMutation.isLoading) {
      return;
    }

    decryptUserMutation.mutate(
      { fields, authToken },
      {
        onSuccess: handleDecryptedData,
        onError: (error: unknown) => {
          Logger.error(
            `useDecryptKycData failed to decrypt user data (${fields.join(', ')}) for KYC, ${getErrorMessage(error)}`,
            { location: 'kyc-confirm' },
          );
          onError(error);
        },
      },
    );
  };

  useUserToken(
    { authToken },
    {
      onSuccess: handleTokenSuccess,
      onError: (error: unknown) => {
        Logger.error(`useDecryptKycData failed to fetch user token info, ${getErrorMessage(error)}`, {
          location: 'kyc-confirm',
        });
        onError(error);
      },
    },
  );
};

export default useDecryptKycData;
