import { useTranslation } from '@onefootprint/hooks';
import { Typography } from '@onefootprint/ui';
import React from 'react';

const BiometricRegisteredEventHeader = () => {
  const { t } = useTranslation(
    'pages.user-details.audit-trail.timeline.biometric-registered-event',
  );

  return <Typography variant="label-3">{t('title')}</Typography>;
};

export default BiometricRegisteredEventHeader;
