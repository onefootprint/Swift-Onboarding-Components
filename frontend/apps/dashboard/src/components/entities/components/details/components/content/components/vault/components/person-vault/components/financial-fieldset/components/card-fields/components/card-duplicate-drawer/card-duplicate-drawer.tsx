import type { DuplicateDataItem, VaultValue } from '@onefootprint/types';
import { Drawer, Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import DuplicateUser from '../../../duplicate-user';
type CardDuplicateDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  dupes: DuplicateDataItem[];
  fingerprint: VaultValue;
};

const CardDuplicateDrawer = ({ isOpen, onClose, dupes, fingerprint }: CardDuplicateDrawerProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'duplicate-data.drawer',
  });

  const filteredDupes = dupes.filter(dupe => dupe.data.some(data => data.value === fingerprint));

  return (
    <Drawer open={isOpen} onClose={onClose} title={t('card-title')}>
      <Stack direction="column" gap={4}>
        {filteredDupes.map(dupe => (
          <DuplicateUser key={dupe.fpId} dupe={dupe} />
        ))}
      </Stack>
    </Drawer>
  );
};

export default CardDuplicateDrawer;
