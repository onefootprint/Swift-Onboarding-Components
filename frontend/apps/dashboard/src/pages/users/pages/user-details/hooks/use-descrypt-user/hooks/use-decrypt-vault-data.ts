import {
  DecryptedUserDataAttributes,
  IdDocType,
  UserDataAttribute,
} from '@onefootprint/types';
import { UserVaultData } from 'src/pages/users/users.types';

import useDecryptIdDoc from './hooks/use-decrypt-id-doc';
import useDecryptKycData from './hooks/use-decrypt-kyc-data';

// The backend stores base64 images with the prefix stripped. To display
// decrypted images in the dashboard UI, convert it back to valid base64 first
const addBase64Prefix = (imageData: string) => `data:png;base64,${imageData}`;

const useDecryptVaultData = (userId: string) => {
  const decryptKycData = useDecryptKycData();
  const decryptIdDoc = useDecryptIdDoc();

  return (
    data: {
      kycData: UserDataAttribute[];
      idDoc: IdDocType[];
      reason: string;
    },
    options?: {
      onSuccess?: (vaultData: UserVaultData) => void;
      onError?: (error: unknown) => void;
    },
  ) => {
    const { kycData, idDoc, reason } = data;
    const decryptedVaultData: UserVaultData = {
      idDoc: {},
      kycData: {},
    };
    const promises = [];

    if (kycData.length) {
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
    }

    if (idDoc.length) {
      idDoc.forEach(documentType => {
        const decryptIdDocPromise = decryptIdDoc.mutateAsync(
          { userId, reason, documentType },
          {
            onSuccess: ({ images }) => {
              if (!decryptedVaultData.idDoc[documentType]) {
                decryptedVaultData.idDoc[documentType] = [];
              }
              const decryptedImages = images.map(image => ({
                front: addBase64Prefix(image.front),
                back: image.back ? addBase64Prefix(image.back) : undefined,
              }));
              decryptedVaultData.idDoc[documentType]?.push(...decryptedImages);
            },
          },
        );
        promises.push(decryptIdDocPromise);
      });
    }

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
