import type { ListEntryCreatedEvent } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import Pill from '../components/pill';

type ListEntryCreatedEventHeaderProps = {
  user: string;
  event: ListEntryCreatedEvent;
};

const HEADER_HEIGHT = '32px';

const ListEntryCreatedEventHeader = ({ user, event }: ListEntryCreatedEventHeaderProps) => {
  const { t } = useTranslation('lists', {
    keyPrefix: 'details.activity-log.create-list-entry',
  });

  return (
    <Stack rowGap={2} columnGap={3} flexWrap="wrap" align="center" minHeight={HEADER_HEIGHT}>
      <Text variant="label-3" display="inline-flex" alignItems="center" height={HEADER_HEIGHT}>
        {user}
      </Text>
      <Text variant="body-3" color="tertiary" display="inline-flex" alignItems="center" height={HEADER_HEIGHT}>
        {t('verb')}
      </Text>
      {event.data.entries.map(e => (
        <Pill height={HEADER_HEIGHT} key={e}>
          {e}
        </Pill>
      ))}
    </Stack>
  );
};

export default ListEntryCreatedEventHeader;
