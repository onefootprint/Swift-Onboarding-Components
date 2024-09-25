import type { Entity } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';

export type AbandonedEventHeaderProps = {
  entity: Entity;
};

const AbandonedEventHeader = ({ entity }: AbandonedEventHeaderProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'audit-trail.timeline.abandoned-event',
  });

  return (
    <Text variant="label-3" color="warning">
      {t(`title.${entity.kind}` as ParseKeys<'common'>)}
    </Text>
  );
};

export default AbandonedEventHeader;
