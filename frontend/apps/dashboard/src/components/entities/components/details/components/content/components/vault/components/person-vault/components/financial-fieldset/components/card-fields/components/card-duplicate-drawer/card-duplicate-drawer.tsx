import type { DuplicateDataItem, VaultValue } from '@onefootprint/types';
import { Drawer, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import DuplicateUser from '../../../duplicate-user';
import DuplicatesLoading from '../../../duplicates-loading';

type CardDuplicateDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  dupes: DuplicateDataItem[];
  fingerprint: VaultValue;
  isLoading: boolean;
};

const CardDuplicateDrawer = ({ isOpen, onClose, dupes, fingerprint, isLoading }: CardDuplicateDrawerProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'duplicate-data.drawer',
  });

  const filteredDupes = dupes.filter(dupe => dupe.data.some(data => data.value === fingerprint));

  return (
    <Drawer open={isOpen} onClose={onClose} title={t('card.title')}>
      {isLoading ? (
        <DuplicatesLoading />
      ) : (
        <Stack direction="column" gap={4}>
          <Text variant="body-3">{t('card.subtitle')}</Text>
          {filteredDupes.map(dupe => (
            <DuplicateUser key={dupe.fpId} dupe={dupe} />
          ))}
        </Stack>
      )}
    </Drawer>
  );
};

export default CardDuplicateDrawer;
