import type { DuplicateDataItem } from '@onefootprint/types';
import { Drawer, Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import DuplicateUser from '../../../duplicate-user';

type CardDuplicateDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  dupes: DuplicateDataItem[];
};

const CardDuplicateDrawer = ({ isOpen, onClose, dupes }: CardDuplicateDrawerProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'duplicate-data.drawer',
  });

  return (
    <Drawer open={isOpen} onClose={onClose} title={t('card-title')}>
      <Stack direction="column" gap={4}>
        {dupes.map(dupe => (
          <DuplicateUser key={dupe.fpId} dupe={dupe} />
        ))}
      </Stack>
    </Drawer>
  );
};

export default CardDuplicateDrawer;
