import type { Entity } from '@onefootprint/types';
import { Stack, Tag } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

export type TagsProps = {
  entity: Entity;
  showFraudLabel?: boolean;
};

const Labels = ({ entity: { watchlistCheck, requiresManualReview, hasOutstandingWorkflowRequest } }: TagsProps) => {
  const { t } = useTranslation('users', { keyPrefix: 'table.row.status' });
  const onWatchlist = watchlistCheck?.status === 'fail';
  const showLabels = hasOutstandingWorkflowRequest || onWatchlist || requiresManualReview;

  return showLabels ? (
    <Stack gap={2}>
      {hasOutstandingWorkflowRequest && <Tag>{t('outstanding-workflow-request')}</Tag>}
      {onWatchlist && <Tag>{t('on-watchlist')}</Tag>}
      {requiresManualReview && <Tag>{t('on-review')}</Tag>}
    </Stack>
  ) : null;
};

export default Labels;
