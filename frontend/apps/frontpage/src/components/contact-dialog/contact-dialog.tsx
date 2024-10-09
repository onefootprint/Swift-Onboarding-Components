import { Dialog } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import HubspotContactForm from './components/hubspot-contact-form';

type ContactDialogProps = {
  open: boolean;
  onClose: () => void;
};

const ContactDialog = ({ open, onClose }: ContactDialogProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.contact-us-dialog',
  });

  return (
    <Dialog size="compact" title={t('title')} onClose={onClose} open={open}>
      <HubspotContactForm />
    </Dialog>
  );
};

export default ContactDialog;
