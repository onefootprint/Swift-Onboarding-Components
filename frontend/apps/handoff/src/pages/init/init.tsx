import { DeviceInfo, useDeviceInfo } from '@onefootprint/hooks';
import { D2PStatusUpdate, TenantInfo } from '@onefootprint/types';
import { LoadingIndicator } from '@onefootprint/ui';
import { HandoffUrlQuery, useParseHandoffUrl } from 'footprint-elements';
import React from 'react';
import useHandoffMachine from 'src/hooks/use-handoff-machine';
import { Events } from 'src/utils/state-machine';

import useUpdateD2PStatus from '../../hooks/use-update-d2p-status';
import useTenantInfo from './hooks/use-tenant-info';

const Init = () => {
  const [, send] = useHandoffMachine();
  const updateD2PStatusMutation = useUpdateD2PStatus();

  const updateD2P = (authToken: string) => {
    if (authToken) {
      updateD2PStatusMutation.mutate({
        authToken,
        status: D2PStatusUpdate.inProgress,
      });
    }
  };

  useParseHandoffUrl({
    onSuccess: (query: HandoffUrlQuery) => {
      const { authToken, tenantPk } = query;
      // Tell the api that d2p is in progress now
      updateD2P(authToken);
      send({
        type: Events.authTokenReceived,
        payload: {
          authToken,
          tenantPk,
        },
      });
    },
  });

  useTenantInfo({
    onSuccess: (tenant: TenantInfo) => {
      send({
        type: Events.tenantInfoReceived,
        payload: {
          tenant,
        },
      });
    },
  });

  useDeviceInfo((info: DeviceInfo) => {
    send({
      type: Events.deviceInfoIdentified,
      payload: info,
    });
  });

  return <LoadingIndicator />;
};

export default Init;
