import { getErrorMessage, RequestError } from '@onefootprint/request';
import {
  DecryptedUserAttributes,
  UserDataAttribute,
  UserDataAttributeKey,
} from '@onefootprint/types';
import { Box, Divider, useToast } from '@onefootprint/ui';
import React from 'react';
import { useEffectOnce } from 'usehooks-ts';

import { User } from '../../../../hooks/use-join-users';
import { UserData } from '../../../../hooks/use-user-data';
import { Event } from '../../utils/decrypt-state-machine';
import { useDecryptMachine } from '../decrypt-machine-provider';
import AuditTrail from './components/audit-trail';
import BasicInfo from './components/basic-info';
import Insights from './components/insights';
import RiskSignals from './components/signals';
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
        userId: user.id,
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
      <Box sx={{ marginBottom: 9 }}>
        <BasicInfo user={user} onDecrypt={handleDecrypt} />
      </Box>
      {user.isPortable ? (
        <>
          <Box sx={{ marginBottom: 9 }}>
            <AuditTrail user={user} />
          </Box>
          <Box sx={{ marginBottom: 9 }}>
            <RiskSignals />
          </Box>
          <Box>
            <Insights user={user} />
          </Box>
        </>
      ) : null}
    </>
  );
};

export default UserDetailsData;
