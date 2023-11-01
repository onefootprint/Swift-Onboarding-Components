import { Stack, Tag } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type TagsProps = {
  onWatchlist: boolean;
  onManualReview: boolean;
};

const Tags = ({ onWatchlist, onManualReview }: TagsProps) => {
  const { t } = useTranslation('users');

  return (
    <Stack gap={2}>
      {onWatchlist && <Tag>{t('table.row.status.on-watchlist')}</Tag>}
      {onManualReview && <Tag>{t('table.row.status.on-review')}</Tag>}
    </Stack>
  );
};

export default Tags;
