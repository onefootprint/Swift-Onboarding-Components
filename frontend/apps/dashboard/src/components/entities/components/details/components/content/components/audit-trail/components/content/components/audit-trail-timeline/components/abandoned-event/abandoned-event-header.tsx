import { useTranslation } from '@onefootprint/hooks';
import type { Entity } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';

export type AbandonedEventHeaderProps = {
  entity: Entity;
};

const AbandonedEventHeader = ({ entity }: AbandonedEventHeaderProps) => {
  const { t } = useTranslation(
    'pages.entity.audit-trail.timeline.abandoned-event',
  );

  return (
    <Typography variant="label-3" color="warning">
      {t(`title.${entity.kind}`)}
    </Typography>
  );
};

export default AbandonedEventHeader;
