import {
  DecryptedUserDataAttributes,
  IdDocType,
  UserDataAttribute,
} from '@onefootprint/types';

import { UserVaultData } from '../../types';
import useDecryptIdDoc from './use-decrypt-id-doc';
import useDecryptKycData from './use-decrypt-kyc-data';

export type DecryptCallbackArgs = {
  data: {
    kycData: UserDataAttribute[];
    idDoc: IdDocType[];
    reason: string;
  };
  options?: {
    onSuccess?: (vaultData: UserVaultData) => void;
    onError?: (error: unknown) => void;
  };
};

const useDecryptVaultData = (userId: string) => {
  const decryptKycData = useDecryptKycData();
  const decryptIdDoc = useDecryptIdDoc();

  return (args: DecryptCallbackArgs) => {
    const {
      data: { kycData, idDoc, reason },
      options,
    } = args;
    const decryptedVaultData: UserVaultData = {
      idDoc: {},
      kycData: {},
    };
    const promises = [];

    const decryptKycDataPromise = decryptKycData.mutateAsync(
      { userId, fields: kycData, reason },
      {
        onSuccess: decryptedKycData => {
          // Convert camel case key from api to match UserDataAttribute keys
          const keys = Object.keys(
            decryptedKycData,
          ) as unknown as (keyof DecryptedUserDataAttributes)[];
          keys.forEach(key => {
            const value = decryptedKycData[key];
            if (value !== undefined) {
              const attrKey = (UserDataAttribute as any)[
                key
              ] as UserDataAttribute;
              decryptedVaultData.kycData[attrKey] = value;
            }
          });
        },
      },
    );
    promises.push(decryptKycDataPromise);

    idDoc.forEach(documentType => {
      const decryptIdDocPromise = decryptIdDoc.mutateAsync(
        { userId, reason, documentType },
        {
          onSuccess: ({ images }) => {
            if (!decryptedVaultData.idDoc[documentType]) {
              decryptedVaultData.idDoc[documentType] = [];
            }
            decryptedVaultData.idDoc[documentType]?.push(...images);
          },
        },
      );
      promises.push(decryptIdDocPromise);
    });

    Promise.all(promises)
      .then(() => {
        options?.onSuccess?.(decryptedVaultData);
      })
      .catch(error => {
        options?.onError?.(error as unknown);
      });
  };
};

export default useDecryptVaultData;
