import { type Entity, EntityLabel } from '@onefootprint/types';
import { Stack, Tag } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useLabel from 'src/hooks/use-label';

export type TagsProps = {
  entity: Entity;
};

const Labels = ({ entity: { id, watchlistCheck, requiresManualReview, hasOutstandingWorkflowRequest } }: TagsProps) => {
  const { t } = useTranslation('users', { keyPrefix: 'table.row.status' });
  const { data: label } = useLabel(id);
  const onWatchlist = watchlistCheck?.status === 'fail';
  const showLabels = hasOutstandingWorkflowRequest || onWatchlist || requiresManualReview || label;

  const getLabel = () => {
    if (label === EntityLabel.active) {
      return t('label.active');
    }
    if (label === EntityLabel.offboard_fraud) {
      return t('label.offboard_fraud');
    }
    if (label === EntityLabel.offboard_other) {
      return t('label.offboard_other');
    }
    return '';
  };

  return showLabels ? (
    <Stack gap={2}>
      {hasOutstandingWorkflowRequest && <Tag>{t('outstanding-workflow-request')}</Tag>}
      {onWatchlist && <Tag>{t('on-watchlist')}</Tag>}
      {requiresManualReview && <Tag>{t('on-review')}</Tag>}
      {label && <Tag>{getLabel()}</Tag>}
    </Stack>
  ) : null;
};

export default Labels;
