import {
  DecryptDataResponse,
  IdDocType,
  UserDataAttribute,
} from '@onefootprint/types';
import { UserVaultData } from 'src/pages/users/users.types';

import useDecryptData from './hooks/use-decrypt-data';
import useDecryptIdDoc from './hooks/use-decrypt-id-doc';

// The backend stores base64 images with the prefix stripped. To display
// decrypted images in the dashboard UI, convert it back to valid base64 first
const addBase64Prefix = (imageData: string) => `data:png;base64,${imageData}`;

// TODO: Support decrypting investorProfile
// https://linear.app/footprint/issue/FP-3140/dashboard-broken-decrypt
const useDecryptVaultData = (userId: string) => {
  const decryptData = useDecryptData();
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
      investorProfile: {},
    };
    const promises = [];

    if (kycData.length) {
      const dataIdentifiers = kycData.map(f => `id.${f}`);
      const decryptKycDataPromise = decryptData.mutateAsync(
        { userId, fields: dataIdentifiers, reason },
        {
          onSuccess: (decrypytedData: DecryptDataResponse) => {
            Object.entries(decrypytedData).forEach(entry => {
              // The key from the backend has and `id.` prefix for any identity data, which
              // is the only kind of data we decrypt now
              const [key, value] = entry;
              const keyParts = key.split('.');
              if (value !== undefined && keyParts[0] === 'id') {
                const attrKey = keyParts[1] as UserDataAttribute;
                decryptedVaultData.kycData[attrKey] = value;
              }
              // TODO handle decrypting custom data
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
                ...image,
                front: addBase64Prefix(image.front),
                back: image.back ? addBase64Prefix(image.back) : undefined,
                selfie: image.selfie
                  ? addBase64Prefix(image.selfie)
                  : undefined,
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
