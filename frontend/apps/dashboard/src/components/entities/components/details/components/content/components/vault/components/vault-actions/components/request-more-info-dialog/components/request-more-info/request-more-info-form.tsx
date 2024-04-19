import {
  OnboardingConfigKind,
  OrgFrequentNoteKind,
  TriggerKind,
  WorkflowStatus,
} from '@onefootprint/types';
import { mostRecentWorkflow } from '@onefootprint/types/src/data/entity';
import type { SelectOption } from '@onefootprint/ui';
import {
  Checkbox,
  Radio,
  Select,
  Shimmer,
  Stack,
  Text,
  Tooltip,
} from '@onefootprint/ui';
import React, { useEffect } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import AnimatedContainer from 'src/components/animated-container';
import FrequentNotesTextArea from 'src/components/frequent-notes-text-area';
import usePlaybookOptions from 'src/pages/home/hooks/use-playbook-options';
import styled, { css } from 'styled-components';

import useEntity from '@/entity/hooks/use-entity';
import useEntityId from '@/entity/hooks/use-entity-id';

export type TriggerFormData = {
  kind: TriggerKind;
  collectSelfie: boolean;
  playbook?: SelectOption;
  note?: string;
};

type RequestMoreInfoFormProps = {
  onSubmit: (data: TriggerFormData) => void;
  formId: string;
};

const RequestMoreInfoForm = ({
  onSubmit,
  formId,
}: RequestMoreInfoFormProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.actions.request-more-info',
  });
  const entityId = useEntityId();
  const entity = useEntity(entityId);
  const { data: playbooksData } = usePlaybookOptions({
    kinds: [
      OnboardingConfigKind.document,
      OnboardingConfigKind.kyb,
      OnboardingConfigKind.kyc,
    ],
  });

  const methods = useForm<TriggerFormData>();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
    setValue,
  } = methods;

  const triggerKind = watch('kind');
  const selectedPlaybook = watch('playbook');

  useEffect(() => {
    // Once the playbooks load, select the playbook the user last onboarded onto as the default
    // selected option
    const defaultPlaybookId =
      entity.data?.workflows.sort(mostRecentWorkflow)[0]?.playbookId;
    const defaultPlaybookValue = playbooksData?.find(
      p => p.value === defaultPlaybookId,
    );
    if (!defaultPlaybookValue || !defaultPlaybookId || selectedPlaybook) {
      return;
    }
    setValue('playbook', defaultPlaybookValue);
  }, [playbooksData, selectedPlaybook, setValue, entity]);
  const hasPriorOnboarding = !!entity.data?.workflows.some(
    wf =>
      wf.status === WorkflowStatus.pass || wf.status === WorkflowStatus.fail,
  );

  const handleBeforeSubmit = (data: TriggerFormData) => {
    onSubmit(data);
  };

  return (
    <FormProvider {...methods}>
      <StyledForm id={formId} onSubmit={handleSubmit(handleBeforeSubmit)}>
        <Text variant="label-3">{t('prompt')}</Text>
        <Stack paddingBottom={2} direction="column" gap={4}>
          <div>
            <Tooltip
              disabled={hasPriorOnboarding}
              position="left"
              text={t('form.cannot-request-info')}
            >
              <Radio
                value={TriggerKind.IdDocument}
                label={t('form.id-photo.title')}
                disabled={!hasPriorOnboarding}
                {...register('kind', { required: true })}
              />
            </Tooltip>
            <AnimatedContainer
              isExpanded={triggerKind === TriggerKind.IdDocument}
              marginLeft={8}
              marginTop={4}
            >
              <Checkbox
                label={t('form.id-photo.collect-selfie')}
                {...register('collectSelfie', { required: false })}
              />
            </AnimatedContainer>
          </div>
          <Tooltip
            disabled={hasPriorOnboarding}
            position="left"
            text={t('form.cannot-request-info')}
          >
            <Radio
              value={TriggerKind.ProofOfSsn}
              label={t('form.proof-of-ssn.title')}
              disabled={!hasPriorOnboarding}
              {...register('kind', { required: true })}
            />
          </Tooltip>
          <Tooltip
            disabled={hasPriorOnboarding}
            position="left"
            text={t('form.cannot-request-info')}
          >
            <Radio
              value={TriggerKind.ProofOfAddress}
              label={t('form.proof-of-address.title')}
              disabled={!hasPriorOnboarding}
              {...register('kind', { required: true })}
            />
          </Tooltip>
          <div>
            <Radio
              value={TriggerKind.Onboard}
              label={t('form.onboard.title')}
              {...register('kind', { required: true })}
            />
            <AnimatedContainer
              isExpanded={triggerKind === TriggerKind.Onboard}
              marginLeft={8}
              marginTop={2}
            >
              {playbooksData?.length ? (
                <Controller
                  control={control}
                  name="playbook"
                  rules={{ required: triggerKind === TriggerKind.Onboard }}
                  render={select => (
                    <Select
                      hasError={!!select.fieldState.error}
                      size="compact"
                      hint={
                        select.fieldState.error &&
                        t('form.onboard.playbook-required')
                      }
                      placeholder={t('form.onboard.select-a-playbook')}
                      onBlur={select.field.onBlur}
                      onChange={select.field.onChange}
                      options={playbooksData}
                      value={select.field.value}
                    />
                  )}
                />
              ) : (
                <Shimmer sx={{ height: '38px', width: '100%' }} />
              )}
            </AnimatedContainer>
          </div>
          {errors.kind && (
            <Text variant="body-4" color="error">
              {t('form.error')}
            </Text>
          )}
        </Stack>
        <FrequentNotesTextArea
          kind={OrgFrequentNoteKind.Trigger}
          formField="note"
          label={t('form.note-for-user.label')}
          placeholder={t('form.note-for-user.placeholder')}
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
    gap: ${theme.spacing[5]};
  `}
`;
