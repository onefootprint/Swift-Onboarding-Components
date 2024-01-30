import type { LivenessEventData } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import capitalize from 'lodash/capitalize';
import React from 'react';
import { useTranslation } from 'react-i18next';

import EventBodyEntry from '../event-body-entry';

type LivenessEventBodyProps = {
  data: LivenessEventData;
};

const LivenessEventBody = ({ data }: LivenessEventBodyProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail.timeline.liveness-event',
  });
  const {
    insightEvent: { ipAddress },
    attributes,
  } = data;
  const { issuers, device, os } = attributes ?? {};

  return (
    <div data-test-id="liveness-event-body" data-private>
      {issuers && (
        <EventBodyEntry
          content={
            <>
              {t('attested-by')}
              {issuers?.map((issuer, i) => (
                <>
                  <Typography variant="label-3" sx={{ marginX: 2 }}>
                    {capitalize(issuer)}
                  </Typography>
                  {i === issuers.length - 1 ? '' : ' and '}
                </>
              ))}
            </>
          }
        />
      )}
      {device && (
        <EventBodyEntry
          content={
            <>
              {t('device-os')}
              <Typography variant="label-3" sx={{ marginLeft: 2 }}>
                {`${device} (${os ?? ''})`}
              </Typography>
            </>
          }
        />
      )}
      {ipAddress && (
        <EventBodyEntry
          content={
            <>
              {t('ip-address')}
              <Typography variant="label-3" sx={{ marginLeft: 2 }}>
                {ipAddress}
              </Typography>
            </>
          }
        />
      )}
    </div>
  );
};

export default LivenessEventBody;
