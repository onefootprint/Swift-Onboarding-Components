import { useTranslation } from '@onefootprint/hooks';
import { LivenessEventData, LivenessSource } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';

type LivenessEventHeaderProps = {
  data: LivenessEventData;
};

const LivenessEventHeader = ({ data }: LivenessEventHeaderProps) => {
  const { t } = useTranslation(
    'pages.entity.audit-trail.timeline.liveness-event',
  );
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
