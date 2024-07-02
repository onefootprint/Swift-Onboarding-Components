import type { LivenessEventData } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
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
    <div data-test-id="liveness-event-body" data-dd-privacy="mask">
      {issuers && (
        <EventBodyEntry
          content={
            <>
              {t('attested-by')}
              {issuers?.map((issuer, i) => (
                <React.Fragment key={issuer}>
                  <Text variant="label-3" marginLeft={2} marginRight={2}>
                    {capitalize(issuer)}
                  </Text>
                  {i === issuers.length - 1 ? '' : ' and '}
                </React.Fragment>
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
              <Text variant="label-3" marginLeft={2}>
                {`${device} (${os ?? ''})`}
              </Text>
            </>
          }
        />
      )}
      {ipAddress && (
        <EventBodyEntry
          content={
            <>
              {t('ip-address')}
              <Text variant="label-3" marginLeft={2}>
                {ipAddress}
              </Text>
            </>
          }
        />
      )}
    </div>
  );
};

export default LivenessEventBody;
