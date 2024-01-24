import type { Entity } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type AbandonedEventHeaderProps = {
  entity: Entity;
};

const AbandonedEventHeader = ({ entity }: AbandonedEventHeaderProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail.timeline.abandoned-event',
  });

  return (
    <Typography variant="label-3" color="warning">
      {t(`title.${entity.kind}` as ParseKeys<'common'>)}
    </Typography>
  );
};

export default AbandonedEventHeader;
