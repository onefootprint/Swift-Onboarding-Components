import type { Entity } from '@onefootprint/types';
import { Stack, Tag } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type TagsProps = {
  entity: Entity;
};

const Tags = ({ entity }: TagsProps) => {
  const { t } = useTranslation('users');
  const {
    watchlistCheck,
    requiresManualReview,
    hasOutstandingWorkflowRequest,
  } = entity;
  const onWatchlist = watchlistCheck?.status === 'fail';

  return (
    <Stack gap={2}>
      {hasOutstandingWorkflowRequest && (
        <Tag>{t('table.row.status.outstanding-workflow-request')}</Tag>
      )}
      {onWatchlist && <Tag>{t('table.row.status.on-watchlist')}</Tag>}
      {requiresManualReview && <Tag>{t('table.row.status.on-review')}</Tag>}
    </Stack>
  );
};

export default Tags;
