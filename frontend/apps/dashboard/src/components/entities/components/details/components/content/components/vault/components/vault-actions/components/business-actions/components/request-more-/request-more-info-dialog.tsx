import useEntityId from '@/entity/hooks/use-entity-id';
import { Dialog } from '@onefootprint/ui';

import Form from './components/request-more-info-form';
import useBusinessOwners from './hooks/use-business-owners';

export type RequestMoreInfoDialogProps = {
  open: boolean;
  onClose: () => void;
};

const RequestMoreInfoDialog = ({ open, onClose }: RequestMoreInfoDialogProps) => {
  const entityId = useEntityId();
  const bosQuery = useBusinessOwners(entityId);

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
      <Form onSubmit={handleSubmit} businessOwners={bosQuery.data ?? []} />
    </Dialog>
  );
};

export default RequestMoreInfoDialog;
