import { useRequestErrorToast } from '@onefootprint/hooks';

import useEntity from '@/entity/hooks/use-entity';
import useEntityId from '@/entity/hooks/use-entity-id';
import {
  ActionRequestKind,
  CollectedKybDataOption,
  DocumentRequestKind,
  TriggerKind,
  type TriggerResponse,
} from '@onefootprint/types';
import { Dialog } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useBusinessOwners from 'src/hooks/use-business-owners';
import useSubmitActions from 'src/hooks/use-submit-actions';
import type { AddBoFormValues, UploadDocsFormValues } from '../request-more-info.types';
import AddBoForm from './add-bo-form';
import KindForm from './kind-form';
import UploadDocsForm from './upload-docs-form';

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
  const showErrorToast = useRequestErrorToast();

  const getBo = (boId: string) => {
    if (!bosQuery.data) throw new Error('Business owners data is not available');
    const bo = bosQuery.data.find(({ id }) => id === boId);
    if (!bo) throw new Error(`Business owner with ID ${boId} not found`);
    return bo;
  };

  const handleUploadDocsSubmit = (formValues: UploadDocsFormValues) => {
    return submitMutation.mutate(
      {
        entityId: formValues.boId,
        actions: [
          {
            kind: ActionRequestKind.trigger,
            note: formValues.note,
            fpBid: entityId,
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
              },
            },
          },
        ],
      },
      {
        onSuccess: (response, request) => {
          const bo = getBo(request.entityId);
          onSubmit({ bo: { id: bo.id, hasPhone: bo.hasPhone }, action: response[0] });
        },
        onError: showErrorToast,
      },
    );
  };

  const handleAddBoSubmit = (formValues: AddBoFormValues) => {
    const sortDataDescending = (a: { createdAt: string }, b: { createdAt: string }) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    const mostRecentWorkflow = entityQuery.data?.workflows.sort(sortDataDescending)[0];
    if (!mostRecentWorkflow) throw new Error('Most recent workflow not found');
    return submitMutation.mutate(
      {
        entityId: formValues.boId,
        actions: [
          {
            kind: ActionRequestKind.trigger,
            note: formValues.note,
            fpBid: entityId,
            trigger: {
              kind: TriggerKind.Onboard,
              data: {
                playbookId: mostRecentWorkflow.playbookId,
                recollectAttributes: [CollectedKybDataOption.kycedBeneficialOwners],
                reuseExistingBoKyc: true,
              },
            },
          },
        ],
      },
      {
        onSuccess: (response, request) => {
          const bo = getBo(request.entityId);
          onSubmit({ bo: { id: bo.id, hasPhone: bo.hasPhone }, action: response[0] });
        },
        onError: showErrorToast,
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
        label: t('next'),
        type: 'submit',
        form: 'request-more-info-form',
        loading: submitMutation.isPending,
      }}
      secondaryButton={{
        label: t('cancel'),
        onClick: onClose,
        disabled: submitMutation.isPending,
      }}
    >
      {entityQuery.data && bosQuery.data ? (
        <KindForm entity={entityQuery.data}>
          {requestType => {
            if (requestType === 'uploadDocument') {
              return <UploadDocsForm onSubmit={handleUploadDocsSubmit} businessOwners={bosQuery.data} />;
            }
            return <AddBoForm onSubmit={handleAddBoSubmit} businessOwners={bosQuery.data} />;
          }}
        </KindForm>
      ) : null}
    </Dialog>
  );
};

export default FormDialog;
