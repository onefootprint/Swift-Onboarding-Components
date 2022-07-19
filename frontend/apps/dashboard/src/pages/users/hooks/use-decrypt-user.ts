import { partial } from 'lodash';
import { useMutation } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';
import { DataKind, DataKindType, DecryptedUserAttributes } from 'src/types';

import useUserData from './use-user-data';

export type DecryptUserRequest = {
  footprintUserId: string;
  attributes: string[];
  reason: string;
};

const decryptUserRequest = async (
  authHeaders: AuthHeaders,
  data: DecryptUserRequest,
) => {
  const { data: response } = await request<
    RequestResponse<DecryptedUserAttributes>
  >({
    method: 'POST',
    url: '/org/decrypt',
    data,
    headers: authHeaders,
  });
  return response.data;
};

// Hook with utilities for decrypting a given user's attributes and storing state for these
// decrypted attributes
const useDecryptUser = () => {
  const { authHeaders } = useSessionUser();

  const { decryptedUsers, updateDecryptedUser, setLoading } = useUserData();

  const decryptUserMutation = useMutation<
    DecryptedUserAttributes,
    RequestError,
    DecryptUserRequest
  >(partial(decryptUserRequest, authHeaders));

  const loadEncryptedAttributes = (
    userId: string,
    fieldsToDecrypt: DataKindType[],
    reason: string,
  ) => {
    // Immediately set these attributes as loading
    setLoading(userId, fieldsToDecrypt);

    // Trigger the mutation to decrypt the data. Upon completion, update these attributes with the
    // decrypted values
    const req: DecryptUserRequest = {
      footprintUserId: userId,
      attributes: fieldsToDecrypt.map(x => DataKind[x]),
      reason,
    };
    decryptUserMutation
      .mutateAsync(req)
      .then((decryptedUserAttributes: DecryptedUserAttributes) => {
        updateDecryptedUser(userId, decryptedUserAttributes);
      })
      .catch(() => setLoading(userId, fieldsToDecrypt, false));
  };

  return {
    decryptedUsers,
    loadEncryptedAttributes,
  };
};

export default useDecryptUser;
