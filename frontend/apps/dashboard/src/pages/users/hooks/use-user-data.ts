import constate from 'constate';
import { DecryptedUserAttributes } from 'src/types';
import type { UserDataAttributeKey } from 'types';
import { useMap } from 'usehooks-ts';

export type UserData = {
  value?: string | null; // Undefined value is encrypted, null value is unset
  exists: boolean;
};

export type UserAttributes = Record<UserDataAttributeKey, UserData>;

// Hook with utilities for maintaining state on decrypted user attributes
const useUserDataImpl = () => {
  const [decryptedUsers, { set: setDecryptedUser }] = useMap<
    String,
    UserAttributes
  >(new Map());

  const updateDecryptedUser = (
    userId: string,
    newDecryptedData: DecryptedUserAttributes,
  ) => {
    const currentDecryptedUser =
      decryptedUsers.get(userId) || ({} as UserAttributes);

    const newAttrs = Object.fromEntries(
      Object.entries(newDecryptedData).map(x => [
        x[0],
        { value: x[1], isLoading: false, exists: true },
      ]),
    );
    setDecryptedUser(userId, {
      ...currentDecryptedUser,
      ...newAttrs,
    });
  };

  const setLoading = (
    userId: string,
    loadingAttributes: UserDataAttributeKey[],
    value = true,
  ) => {
    const currentDecryptedUser =
      decryptedUsers.get(userId) || ({} as UserAttributes);
    const newAttrs = Object.fromEntries(
      loadingAttributes.map(x => [
        x,
        { ...currentDecryptedUser[x], isLoading: value },
      ]),
    );
    setDecryptedUser(userId, {
      ...currentDecryptedUser,
      ...newAttrs,
    });
  };

  return {
    decryptedUsers,
    updateDecryptedUser,
    setLoading,
  };
};

// Create a singleton of this hook that is reused by all invocations. This allows data to be shared
// across multiple invocations of this hook.
const [Provider, useUserData] = constate(useUserDataImpl);
export default useUserData;
export const UserDataProvider = Provider;
