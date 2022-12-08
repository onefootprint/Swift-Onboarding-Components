import { getErrorMessage, RequestError } from '@onefootprint/request';
import {
  DecryptUserResponse,
  IdDocDataAttribute,
  UserDataAttribute,
} from '@onefootprint/types';
import { Box, Divider, useToast } from '@onefootprint/ui';
import React from 'react';
import { DataValue } from 'src/hooks/use-user-store';
import { User } from 'src/pages/users/types/user.types';
import { useEffectOnce } from 'usehooks-ts';

import { Event } from '../../utils/decrypt-state-machine';
import { Fields } from '../../utils/decrypt-state-machine/types';
import { useDecryptMachine } from '../decrypt-machine-provider';
import AuditTrail from './components/audit-trail';
import Insights from './components/insights';
import PinnedNotes from './components/pinned-notes';
import RiskSignals from './components/signals';
import UserHeader from './components/user-header';
import VaultData from './components/vault-data';

type UserDetailsDataProps = {
  user: User;
  decrypt: (
    payload: {
      userId: string;
      kyc: UserDataAttribute[];
      idDoc: IdDocDataAttribute[];
      reason: string;
    },
    options?: {
      onSuccess?: (data: DecryptUserResponse) => void;
      onError?: (error: RequestError) => void;
    },
  ) => void;
};

const UserDetailsData = ({ user, decrypt }: UserDetailsDataProps) => {
  const toast = useToast();
  const [, send] = useDecryptMachine();

  const hydrateFields = () => {
    const fields: Fields = {
      kycData: {},
      idDoc: {},
    };
    const { kycData, idDoc } = user.vaultData;
    Object.entries(kycData).forEach(entry => {
      const attr = entry[0] as UserDataAttribute;
      const value = entry[1] as DataValue;
      if (value !== null) {
        fields.kycData[attr] = true;
      }
    });
    if (idDoc) {
      Object.entries(idDoc).forEach(entry => {
        const attr = entry[0] as IdDocDataAttribute;
        const value = entry[1] as DataValue;
        if (value !== null) {
          fields.idDoc[attr] = true;
        }
      });
    }
    const hasData =
      Object.keys(fields.kycData).length > 0 ||
      Object.keys(fields.idDoc).length > 0;
    if (hasData) {
      send({ type: Event.hydrated, payload: { fields } });
    }
  };
  useEffectOnce(hydrateFields);

  const handleDecrypt = async (
    kyc: UserDataAttribute[],
    idDoc: IdDocDataAttribute[],
    reason: string,
  ) => {
    decrypt(
      {
        userId: user.id,
        kyc,
        idDoc,
        reason,
      },
      {
        onSuccess: () => {
          send({ type: Event.decryptSucceeded });
        },
        onError: (error: RequestError) => {
          send({ type: Event.decryptFailed });
          toast.show({
            description: getErrorMessage(error),
            title: 'Uh-oh!',
            variant: 'error',
          });
        },
      },
    );
  };

  return (
    <>
      <UserHeader user={user} />
      <Box sx={{ marginY: 5 }}>
        <Divider />
      </Box>
      <PinnedNotes />
      <Box sx={{ marginBottom: 9 }}>
        <VaultData user={user} onDecrypt={handleDecrypt} />
      </Box>
      {user.isPortable ? (
        <>
          <Box sx={{ marginBottom: 9 }}>
            <AuditTrail />
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
