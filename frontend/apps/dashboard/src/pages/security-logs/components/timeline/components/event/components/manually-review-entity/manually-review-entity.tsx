import { IcoArrowTopRight16 } from '@onefootprint/icons';
import type { AuditEventDetail } from '@onefootprint/request-types/dashboard';
import { LinkButton, Text } from '@onefootprint/ui';
import capitalize from 'lodash/capitalize';
import { useTranslation } from 'react-i18next';

type ManuallyReviewEntityProps = { detail: AuditEventDetail; hasPrincipalActor: boolean };

const ManuallyReviewEntity = ({ detail, hasPrincipalActor }: ManuallyReviewEntityProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.manual-review' });
  if (detail.kind !== 'manually_review_entity') return null;

  const { decisionStatus, fpId, kind } = detail.data;
  const url = kind === 'person' ? `/users/${fpId}` : `/businesses/${fpId}`;

  return (
    <>
      <Text variant="body-3" color="tertiary" tag="span">
        {hasPrincipalActor ? t('manually-reviewed-and') : capitalize(t('manually-reviewed-and'))}
      </Text>
      <Text variant="body-3" color="tertiary" tag="span">
        {t('marked-a')}
      </Text>
      <LinkButton href={url} target="_blank" iconComponent={IcoArrowTopRight16}>
        {kind === 'person' ? t('user') : t('business')}
      </LinkButton>
      <Text variant="body-3" color="tertiary" tag="span">
        {t('as', { status: decisionStatus })}.
      </Text>
    </>
  );
};

export default ManuallyReviewEntity;
