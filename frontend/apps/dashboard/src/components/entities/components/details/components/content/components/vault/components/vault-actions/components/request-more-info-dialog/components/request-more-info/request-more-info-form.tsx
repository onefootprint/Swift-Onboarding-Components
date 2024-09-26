import { OrgFrequentNoteKind, WorkflowStatus } from '@onefootprint/types';
import { Divider, Hint, Radio, Stack, Toggle, Tooltip } from '@onefootprint/ui';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FrequentNotesTextArea from 'src/components/frequent-notes-text-area';
import styled, { css } from 'styled-components';

import useEntity from '@/entity/hooks/use-entity';
import useEntityId from '@/entity/hooks/use-entity-id';

import RequestDocument from './components/request-document';
import RequestOnboard from './components/request-onboard';
import { RequestMoreInfoKind, type TriggerFormData } from './types';

type RequestVariant = 'document' | 'onboard';

type RequestMoreInfoFormProps = {
  onSubmit: (data: TriggerFormData) => void;
  formId: string;
};

const RequestMoreInfoForm = ({ onSubmit, formId }: RequestMoreInfoFormProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'actions.request-more-info.form',
  });
  const entityId = useEntityId();
  const entity = useEntity(entityId);
  const hasPriorOnboarding = !!entity.data?.workflows.some(
    wf => wf.status === WorkflowStatus.pass || wf.status === WorkflowStatus.fail || wf.status === WorkflowStatus.none,
  );
  const defaultVariant = hasPriorOnboarding ? 'document' : 'onboard';
  const [requestVariant, setRequestVariant] = useState<RequestVariant>(defaultVariant);

  const methods = useForm<TriggerFormData>({
    defaultValues: {
      kinds: defaultVariant === 'onboard' ? [RequestMoreInfoKind.Onboard] : [],
      collectSelfie: false,
      clearManualReview: true,
    },
  });
  const {
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    reset,
    register,
    formState: { errors },
  } = methods;
  const playbook = watch('playbook');

  const handleBeforeSubmit = (data: TriggerFormData) => {
    if (requestVariant === 'document' && data.kinds.length === 0) {
      setError('kinds', {
        type: 'required',
        message: t('kind.required-error.document'),
      });
      return;
    }
    if (requestVariant === 'onboard' && !playbook) {
      setError('kinds', {
        type: 'required',
        message: t('kind.required-error.onboard'),
      });
      return;
    }
    const formData = {
      ...data,
      clearManualReview: data.clearManualReview && entity.data?.requiresManualReview,
    };
    onSubmit(formData);
  };

  const resetForm = () => {
    reset();
    clearErrors();
  };

  const handleRequestVariantSelect = (variant: RequestVariant) => {
    setRequestVariant(variant);
    resetForm();
    if (variant === 'document') {
      setValue('kinds', []);
    }
    if (variant === 'onboard') {
      setValue('kinds', [RequestMoreInfoKind.Onboard]);
    }
  };

  return (
    <FormProvider {...methods}>
      <StyledForm id={formId} onSubmit={handleSubmit(handleBeforeSubmit)}>
        <Stack direction="column" gap={4}>
          <Tooltip text={t('kind.cannot-request-document')} disabled={hasPriorOnboarding}>
            <Radio
              label={t('request-variant.document')}
              checked={requestVariant === 'document'}
              onChange={() => handleRequestVariantSelect('document')}
              disabled={!hasPriorOnboarding}
            />
          </Tooltip>
          <Radio
            label={t('request-variant.onboard')}
            checked={requestVariant === 'onboard'}
            onChange={() => handleRequestVariantSelect('onboard')}
          />
        </Stack>
        <Stack direction="column">
          <RequestDocument visible={requestVariant === 'document'} />
          <RequestOnboard visible={requestVariant === 'onboard'} />
          {errors.kinds && <Hint hasError>{errors.kinds.message as string}</Hint>}
        </Stack>
        {entity.data?.requiresManualReview && (
          <Toggle label={t('clear-review')} checked={watch('clearManualReview')} {...register('clearManualReview')} />
        )}

        <Divider variant="secondary" />
        <FrequentNotesTextArea
          kind={OrgFrequentNoteKind.Trigger}
          formField="note"
          label={t('note-for-user.label')}
          placeholder={t('note-for-user.placeholder')}
        />
      </StyledForm>
    </FormProvider>
  );
};

export default RequestMoreInfoForm;

const StyledForm = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: ${theme.spacing[7]};
  `}
`;
