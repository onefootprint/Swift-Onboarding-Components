import { Dialog } from '@onefootprint/ui';
import Form from './components/request-more-info-form';

export type RequestMoreInfoDialogProps = {
  open: boolean;
  onClose: () => void;
};

const RequestMoreInfoDialog = ({ open, onClose }: RequestMoreInfoDialogProps) => {
  const handleSubmit = () => {
    console.log('submit');
  };

  return (
    <Dialog
      size="compact"
      open={open}
      onClose={onClose}
      title="Request more information"
      primaryButton={{
        label: 'Next',
        type: 'submit',
        form: 'request-more-info-form',
      }}
      secondaryButton={{
        label: 'Cancel',
        onClick: onClose,
      }}
    >
      <Form onSubmit={handleSubmit} />
    </Dialog>
  );
};

export default RequestMoreInfoDialog;
