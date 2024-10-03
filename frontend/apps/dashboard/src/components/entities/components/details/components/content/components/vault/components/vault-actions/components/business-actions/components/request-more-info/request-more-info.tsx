import useEntityId from '@/entity/hooks/use-entity-id';
import { ActionRequestKind, DocumentRequestKind, TriggerKind } from '@onefootprint/types';
import { Dialog } from '@onefootprint/ui';
import { useState } from 'react';
import useSubmitActions from '../../../../hooks/use-submit-actions';
import Confirmation from './components/confirmation';
import Form from './components/form';
import useBusinessOwners from './hooks/use-business-owners';
import type { FormValues } from './request-more-info.types';

export type RequestMoreInfoProps = {
  open: boolean;
  onClose: () => void;
};

const RequestMoreInfo = ({ open, onClose }: RequestMoreInfoProps) => {
  const entityId = useEntityId();
  const bosQuery = useBusinessOwners(entityId);
  const submitMutation = useSubmitActions();
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

  const handleActionSubmit = (formValues: FormValues) => {
    submitMutation.mutate(
      {
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
      },
      {
        onSuccess: () => {
          setShowConfirmationDialog(true);
        },
      },
    );
  };

  return showConfirmationDialog ? (
    <Dialog
      size="compact"
      open={open}
      onClose={onClose}
      title="Request more information"
      primaryButton={{
        label: 'Copy link',
        loading: submitMutation.isPending,
      }}
      secondaryButton={{
        label: 'Send via sms',
        onClick: onClose,
        disabled: submitMutation.isPending,
      }}
    >
      <Confirmation />
    </Dialog>
  ) : (
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
      <Form onSubmit={handleActionSubmit} businessOwners={bosQuery.data ?? []} />
    </Dialog>
  );
};

export default RequestMoreInfo;
