import type { ListEntryDeletedEvent } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import Pill from '../components/pill';

type ListEntryDeletedEventHeaderProps = {
  user: string;
  event: ListEntryDeletedEvent;
};

const HEADER_HEIGHT = '32px';

const ListEntryDeletedEventHeader = ({ user, event }: ListEntryDeletedEventHeaderProps) => {
  const { t } = useTranslation('lists', {
    keyPrefix: 'details.activity-log.delete-list-entry',
  });

  return (
    <Stack rowGap={1} columnGap={3} flexWrap="wrap" align="center" minHeight={HEADER_HEIGHT}>
      <Text variant="label-3">{user}</Text>
      <Text variant="body-3" color="tertiary">
        {t('verb')}
      </Text>
      <Pill height={HEADER_HEIGHT}>{event.data.entry}</Pill>
    </Stack>
  );
};

export default ListEntryDeletedEventHeader;
