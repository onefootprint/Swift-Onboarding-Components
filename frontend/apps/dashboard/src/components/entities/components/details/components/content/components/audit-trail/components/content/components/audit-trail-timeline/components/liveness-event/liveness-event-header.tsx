import type { LivenessEventData } from '@onefootprint/types';
import { LivenessSource } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

type LivenessEventHeaderProps = {
  data: LivenessEventData;
};

const LivenessEventHeader = ({ data }: LivenessEventHeaderProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail.timeline.liveness-event',
  });
  const { source } = data;

  return (
    <Typography variant="label-3" testID="liveness-event-header">
      {source === LivenessSource.skipped
        ? t('skipped-title')
        : t('success-title')}
    </Typography>
  );
};

export default LivenessEventHeader;
