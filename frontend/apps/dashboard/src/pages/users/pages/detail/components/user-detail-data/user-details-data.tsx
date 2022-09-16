import React from 'react';
import { getErrorMessage, RequestError } from 'request';
import {
  DecryptedUserAttributes,
  UserDataAttribute,
  UserDataAttributeKey,
} from 'types';
import { Box, Divider, useToast } from 'ui';
import { useEffectOnce } from 'usehooks-ts';

import { User } from '../../../../hooks/use-join-users';
import { UserData } from '../../../../hooks/use-user-data';
import { Event } from '../../utils/decrypt-state-machine';
import { useDecryptMachine } from '../decrypt-machine-provider';
import AuditTrail from './components/audit-trail';
import BasicInfo from './components/basic-info';
import Insights from './components/insights';
import UserHeader from './components/user-header';

type UserDetailsDataProps = {
  user: User;
  decrypt: (payload: {
    fields: UserDataAttribute[];
    reason: string;
    userId: string;
  }) => Promise<DecryptedUserAttributes>;
};

const UserDetailsData = ({ user, decrypt }: UserDetailsDataProps) => {
  const toast = useToast();
  const [, send] = useDecryptMachine();

  const hydrateFields = () => {
    const fields: Partial<Record<UserDataAttribute, boolean>> = {};
    Object.entries(user.attributes).forEach(([key, item]) => {
      if ((item as UserData).value !== undefined) {
        fields[UserDataAttribute[key as UserDataAttributeKey]] = true;
      }
    });
    if (Object.keys(fields).length > 0) {
      send({ type: Event.hydrated, payload: { fields } });
    }
  };
  useEffectOnce(hydrateFields);

  const handleDecrypt = async (
    fields: Partial<Record<UserDataAttribute, boolean>>,
    reason: string,
  ) => {
    try {
      await decrypt({
        fields: [...(Object.keys(fields) as UserDataAttribute[])],
        reason,
        userId: user.footprintUserId,
      });
      send({ type: Event.decryptSucceeded });
    } catch (error: unknown) {
      send({ type: Event.decryptFailed });
      toast.show({
        description: getErrorMessage(error as RequestError),
        title: 'Uh-oh!',
        variant: 'error',
      });
    }
  };

  return (
    <>
      <UserHeader user={user} />
      <Box sx={{ marginY: 5 }}>
        <Divider />
      </Box>
      <BasicInfo user={user} onDecrypt={handleDecrypt} />
      {user.isPortable ? (
        <Box sx={{ marginTop: 9 }}>
          <AuditTrail user={user} />
        </Box>
      ) : null}
      {user.isPortable ? (
        <Box sx={{ marginTop: 9 }}>
          <Insights user={user} />
        </Box>
      ) : null}
    </>
  );
};

export default UserDetailsData;
