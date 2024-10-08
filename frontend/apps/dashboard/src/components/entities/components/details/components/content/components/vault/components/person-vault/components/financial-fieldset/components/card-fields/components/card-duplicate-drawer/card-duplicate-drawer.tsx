import type { DuplicateDataItem } from '@onefootprint/types';
import { Drawer } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

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
      {dupes.map(dupe => (
        <div key={dupe.fpId}>{dupe.fpId}</div>
      ))}
    </Drawer>
  );
};

export default CardDuplicateDrawer;
