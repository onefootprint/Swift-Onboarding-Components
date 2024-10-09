import { type Entity, EntityLabel } from '@onefootprint/types';
import { Stack, Tag, Tooltip } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

export type TagsProps = {
  entity: Entity;
};

const Labels = ({
  entity: { watchlistCheck, requiresManualReview, hasOutstandingWorkflowRequest, label, tags },
}: TagsProps) => {
  const { t } = useTranslation('businesses', { keyPrefix: 'table.row' });
  const onWatchlist = watchlistCheck?.status === 'fail';
  const showLabels = hasOutstandingWorkflowRequest || onWatchlist || requiresManualReview || label || tags?.length;

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
      {tags && tags.length > 0 && (
        <Tooltip
          alignment="end"
          disabled={tags.length < 2}
          position="bottom"
          text={tags.map(({ tag }) => `#${tag}`).join(', ')}
        >
          <Tag>
            #{tags[0].tag}
            {tags.length > 1 && ` +${Math.min(tags.length - 1, 9)}`}
          </Tag>
        </Tooltip>
      )}
    </Stack>
  ) : null;
};

export default Labels;
