import type { LivenessEventData } from '@onefootprint/types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import createStringList from 'src/utils/create-string-list';

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
  const attestations =
    issuers?.map(issuer => issuer.toUpperCase()).join(' & ') ?? '';

  return (
    <div data-test-id="liveness-event-body" data-private>
      {attestations && (
        <EventBodyEntry content={t('attested-by', { attestations })} />
      )}
      {device && (
        <EventBodyEntry
          content={createStringList([device, os ?? ''], ', ', ', ')}
        />
      )}
      {ipAddress && <EventBodyEntry content={t('ip-address', { ipAddress })} />}
    </div>
  );
};

export default LivenessEventBody;
