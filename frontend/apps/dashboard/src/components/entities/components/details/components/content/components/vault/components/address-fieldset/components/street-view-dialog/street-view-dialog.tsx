import { Dialog } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type StreetViewDialogProps = {
  onClose: () => void;
  open: boolean;
};

const StreetViewDialog = ({ onClose, open }: StreetViewDialogProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'fieldset.address.street-view',
  });

  return (
    <Dialog open={open} onClose={onClose} title={t('title')} size="full-screen">
      Placeholder
    </Dialog>
  );
};

export default StreetViewDialog;
