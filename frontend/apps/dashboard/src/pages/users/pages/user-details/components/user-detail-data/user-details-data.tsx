import { IdDocType, UserDataAttribute } from '@onefootprint/types';
import { Box, Divider } from '@onefootprint/ui';
import React from 'react';
import useUser, { IdDocDataValue, KycDataValue } from 'src/hooks/use-user';
import { useEffectOnce } from 'usehooks-ts';

import useUserId from '../../hooks/use-user-id';
import { Event } from '../../utils/decrypt-state-machine';
import { Fields } from '../../utils/decrypt-state-machine/types';
import { useDecryptMachine } from '../decrypt-machine-provider';
import AuditTrail from './components/audit-trail';
import Insights from './components/insights';
import PinnedNotes from './components/pinned-notes';
import RiskSignals from './components/signals';
import UserHeader from './components/user-header';
import VaultData from './components/vault-data';

const UserDetailsData = () => {
  const [, send] = useDecryptMachine();
  const userId = useUserId();
  const {
    user: { vaultData, metadata },
  } = useUser(userId);

  const hydrateFields = () => {
    const { kycData, idDoc } = vaultData ?? {};
    const fields: Fields = {
      kycData: {},
      idDoc: {},
    };

    if (kycData) {
      Object.entries(kycData).forEach(entry => {
        const attr = entry[0] as UserDataAttribute;
        const value = entry[1] as KycDataValue;
        if (value !== null) {
          fields.kycData[attr] = true;
        }
      });
    }

    if (idDoc) {
      Object.entries(idDoc).forEach(entry => {
        const attr = entry[0] as IdDocType;
        const value = entry[1] as IdDocDataValue;
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

  return (
    <>
      <UserHeader />
      <Box sx={{ marginY: 5 }}>
        <Divider />
      </Box>
      <PinnedNotes />
      <Box sx={{ marginBottom: 9 }}>
        <VaultData />
      </Box>
      {metadata?.isPortable ? (
        <>
          <Box sx={{ marginBottom: 9 }}>
            <AuditTrail />
          </Box>
          <Box sx={{ marginBottom: 9 }}>
            <RiskSignals />
          </Box>
          <Box>
            <Insights />
          </Box>
        </>
      ) : null}
    </>
  );
};

export default UserDetailsData;
