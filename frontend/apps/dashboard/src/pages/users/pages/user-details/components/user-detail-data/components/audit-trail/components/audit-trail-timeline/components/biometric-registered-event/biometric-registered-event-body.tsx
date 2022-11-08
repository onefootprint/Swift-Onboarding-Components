import { useTranslation } from '@onefootprint/hooks';
import { BiometricRegisteredEvent } from '@onefootprint/types';
import React from 'react';

import createStringList from '../../utils/create-string-list';
import EventBodyEntry from '../event-body-entry';

type BiometricRegisteredEventBodyProps = {
  data: BiometricRegisteredEvent;
};

const BiometricRegisteredEventBody = ({
  data,
}: BiometricRegisteredEventBodyProps) => {
  const { t } = useTranslation(
    'pages.user-details.audit-trail.timeline.biometric-registered-event',
  );
  const {
    insightEvent: { ipAddress },
    webauthnCredential,
  } = data;
  const attestations = webauthnCredential?.attestations.join(' & ');
  const { device, os, location } = webauthnCredential ?? {};

  return (
    <>
      {attestations && (
        <EventBodyEntry content={t('attested-by', { attestations })} />
      )}
      {device && (
        <EventBodyEntry
          content={createStringList([device, os ?? ''], ', ', ', ')}
        />
      )}
      {ipAddress && <EventBodyEntry content={t('ip-address', { ipAddress })} />}
      {location && <EventBodyEntry content={location} />}
    </>
  );
};

export default BiometricRegisteredEventBody;
