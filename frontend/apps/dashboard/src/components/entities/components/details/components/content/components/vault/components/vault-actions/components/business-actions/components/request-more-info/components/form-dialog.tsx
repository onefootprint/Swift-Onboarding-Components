import useEntity from '@/entity/hooks/use-entity';
import useEntityId from '@/entity/hooks/use-entity-id';
import { ActionRequestKind, DocumentRequestKind, TriggerKind, type TriggerResponse } from '@onefootprint/types';
import { Dialog } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useBusinessOwners from 'src/hooks/use-business-owners';
import useSubmitActions from 'src/hooks/use-submit-actions';
import type { FormValues } from '../request-more-info.types';
import Form from './form';

export type FormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (formSubmission: { bo: { id: string; hasPhone: boolean }; action: TriggerResponse }) => void;
};

const FormDialog = ({ open, onClose, onSubmit }: FormDialogProps) => {
  const { t } = useTranslation('business-details', { keyPrefix: 'request-more-info' });
  const entityId = useEntityId();
  const entityQuery = useEntity(entityId);
  const bosQuery = useBusinessOwners(entityId);
  const submitMutation = useSubmitActions();

  const handleSubmit = (formValues: FormValues) => {
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
        onSuccess: (response, request) => {
          onSubmit({ bo: { id: request.entityId, hasPhone: true }, action: response[0] });
        },
      },
    );
  };

  return (
    <Dialog
      size="compact"
      open={open}
      onClose={onClose}
      title={t('title')}
      primaryButton={{
        label: t('form.next'),
        type: 'submit',
        form: 'request-more-info-form',
        loading: submitMutation.isPending,
      }}
      secondaryButton={{
        label: t('form.cancel'),
        onClick: onClose,
        disabled: submitMutation.isPending,
      }}
    >
      {entityQuery.data && bosQuery.data ? (
        <Form onSubmit={handleSubmit} entity={entityQuery.data} businessOwners={bosQuery.data} />
      ) : null}
    </Dialog>
  );
};

export default FormDialog;
