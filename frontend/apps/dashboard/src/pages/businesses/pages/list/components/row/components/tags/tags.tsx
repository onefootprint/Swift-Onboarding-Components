import { Stack, Tag } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

export type TagsProps = {
  onWatchlist: boolean;
  onManualReview: boolean;
};

const Tags = ({ onWatchlist, onManualReview }: TagsProps) => {
  const { t } = useTranslation('users', { keyPrefix: 'table.row.status' });

  return (
    <Stack gap={2}>
      {onWatchlist && <Tag>{t('on-watchlist')}</Tag>}
      {onManualReview && <Tag>{t('on-review')}</Tag>}
    </Stack>
  );
};

export default Tags;
