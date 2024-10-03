import useEntityId from '@/entity/hooks/use-entity-id';
import { ActionRequestKind, DocumentRequestKind, TriggerKind } from '@onefootprint/types';
import { Dialog } from '@onefootprint/ui';

import useSubmitActions from '../../../../hooks/use-submit-actions';
import Form from './components/request-more-info-form';
import useBusinessOwners from './hooks/use-business-owners';
import type { FormValues } from './request-more-info.types';

export type RequestMoreInfoDialogProps = {
  open: boolean;
  onClose: () => void;
};

const RequestMoreInfoDialog = ({ open, onClose }: RequestMoreInfoDialogProps) => {
  const entityId = useEntityId();
  const bosQuery = useBusinessOwners(entityId);
  const submitMutation = useSubmitActions();

  const handleSubmit = (formValues: FormValues) => {
    submitMutation.mutate({
      entityId: formValues.boId,
      actions: [
        {
          kind: ActionRequestKind.trigger,
          trigger: {
            kind: TriggerKind.Document,
            data: {
              businessConfigs: formValues.docs.map(doc => ({
                kind: DocumentRequestKind.Custom,
                data: {
                  name: doc.name,
                  identifier: `document.custom.${doc.identifier}`,
                  description: doc.description,
                  requiresHumanReview: true,
                },
              })),
              configs: [],
              fpBid: entityId,
            },
          },
        },
      ],
    });
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
        loading: submitMutation.isPending,
      }}
      secondaryButton={{
        label: 'Cancel',
        onClick: onClose,
        disabled: submitMutation.isPending,
      }}
    >
      <Form onSubmit={handleSubmit} businessOwners={bosQuery.data ?? []} />
    </Dialog>
  );
};

export default RequestMoreInfoDialog;
