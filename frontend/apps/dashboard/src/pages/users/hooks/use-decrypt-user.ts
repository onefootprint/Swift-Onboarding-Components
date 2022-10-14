import request, { RequestError } from '@onefootprint/request';
import {
  DecryptedUserAttributes,
  DecryptUserRequest,
  DecryptUserResponse,
  UserDataAttribute,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import { partial } from 'lodash';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';

import useUserData from './use-user-data';

const decryptUserRequest = async (
  authHeaders: AuthHeaders,
  data: DecryptUserRequest,
) => {
  const response = await request<DecryptUserResponse>({
    method: 'POST',
    url: `/users/${data.footprintUserId}/identity/decrypt`,
    data: { fields: data.fields, reason: data.reason },
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
    DecryptUserResponse,
    RequestError,
    DecryptUserRequest
  >(partial(decryptUserRequest, authHeaders));

  const decryptUser = (payload: {
    userId: string;
    fields: UserDataAttribute[];
    reason: string;
  }): Promise<DecryptUserResponse> =>
    new Promise((resolve, reject) => {
      // Immediately set these attributes as loading
      setLoading(payload.userId, []);
      decryptUserMutation
        .mutateAsync({
          footprintUserId: payload.userId,
          fields: payload.fields,
          reason: payload.reason,
        })
        .then((decryptedUserAttributes: DecryptedUserAttributes) => {
          updateDecryptedUser(payload.userId, decryptedUserAttributes);
          resolve(decryptedUserAttributes);
        })
        .catch(() => {
          setLoading(payload.userId, [], false);
          reject();
        });
    });

  return {
    decryptedUsers,
    decryptUser,
  };
};

export default useDecryptUser;
