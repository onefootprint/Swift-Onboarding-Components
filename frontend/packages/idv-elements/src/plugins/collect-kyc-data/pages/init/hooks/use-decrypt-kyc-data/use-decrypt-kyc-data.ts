import {
  CdoToAllDisMap,
  CollectedKycDataOption,
  DataIdentifier,
  IdDI,
  UserTokenResponse,
  UserTokenScope,
} from '@onefootprint/types';

import useUserToken from '../../../../../../hooks/api/hosted/user/use-user-token';
import useDecryptUser from '../../../../hooks/use-decrypt-user';
import { KycData } from '../../../../utils/data-types';

// These fields are decryptable with any auth token. Other fields are only decryptable if authed
// with biometric
const SENSITIVE_DIS: DataIdentifier[] = [
  IdDI.ssn4,
  IdDI.ssn9,
  IdDI.email,
  IdDI.phoneNumber,
];
const BASIC_PROFILE_DIS: DataIdentifier[] = [...Object.values(IdDI)].filter(
  di => !SENSITIVE_DIS.includes(di),
);

type UseDecryptKycDataArgs = {
  authToken: string;
  populatedCdos: CollectedKycDataOption[];
  onSuccess: (data: KycData) => void;
  onError: (error: unknown) => void;
};

const useDecryptKycData = ({
  authToken,
  populatedCdos,
  onSuccess,
  onError,
}: UseDecryptKycDataArgs) => {
  const decryptUserMutation = useDecryptUser();
  const populatedDis = populatedCdos.flatMap(cdo => CdoToAllDisMap[cdo]);

  const handleDecryptedData = (
    decryptedData: Partial<Record<DataIdentifier, string | undefined>>,
  ) => {
    const data: KycData = {};

    // Create scrubbed entries for populated attributes that weren't decrypted - this allows us
    // to skip collection of them and display a scrubbed value showing that they already exist
    populatedDis.forEach(di => {
      data[di as IdDI] = {
        value: '',
        decrypted: false,
        scrubbed: true,
      };
    });

    // Add the decrypted values if available
    Object.entries(decryptedData).forEach(([di, value = '']) => {
      data[di as IdDI] = {
        value,
        decrypted: true,
        scrubbed: false,
      };
    });

    onSuccess(data);
  };

  const handleTokenSuccess = (response: UserTokenResponse) => {
    const { scopes } = response;
    const canDecryptBasic =
      scopes.includes(UserTokenScope.signup) ||
      scopes.includes(UserTokenScope.basicProfile);
    const canDecryptSensitive = scopes.includes(
      UserTokenScope.sensitiveProfile,
    );

    let fields: DataIdentifier[] = populatedDis;
    if (!canDecryptSensitive) {
      fields = fields.filter(di => BASIC_PROFILE_DIS.includes(di));
    }

    // If can't decrypt or there is nothing to decrypt, return empty data
    if (fields.length === 0 || (!canDecryptBasic && !canDecryptSensitive)) {
      handleDecryptedData({});
      return;
    }

    decryptUserMutation.mutate(
      { fields, authToken },
      {
        onSuccess: handleDecryptedData,
        onError,
      },
    );
  };

  useUserToken(
    { authToken },
    {
      onSuccess: handleTokenSuccess,
      onError,
    },
  );
};

export default useDecryptKycData;
