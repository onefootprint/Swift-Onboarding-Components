import {
  OnboardingConfigKind,
  OrgFrequentNoteKind,
  WorkflowStatus,
} from '@onefootprint/types';
import { mostRecentWorkflow } from '@onefootprint/types/src/data/entity';
import type { SelectOption } from '@onefootprint/ui';
import { Select, Shimmer, Stack, Toggle } from '@onefootprint/ui';
import React, { useEffect } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import AnimatedContainer from 'src/components/animated-container';
import FrequentNotesTextArea from 'src/components/frequent-notes-text-area';
import usePlaybookOptions from 'src/pages/home/hooks/use-playbook-options';
import styled, { css } from 'styled-components';

import useEntity from '@/entity/hooks/use-entity';
import useEntityId from '@/entity/hooks/use-entity-id';

export enum RequestMoreInfoKind {
  Onboard = 'onboard',
  ProofOfAddress = 'proof_of_address',
  ProofOfSsn = 'proof_of_ssn',
  IdDocument = 'id_document',
}

type RequestKindSelectOption = {
  label: string;
  value: RequestMoreInfoKind;
};

export type TriggerFormData = {
  kind?: RequestKindSelectOption;
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
    keyPrefix: 'pages.entity.actions.request-more-info.form',
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

  const methods = useForm<TriggerFormData>({
    defaultValues: {
      collectSelfie: false,
    },
  });
  const { register, handleSubmit, watch, control, setValue } = methods;

  const triggerKind = watch('kind')?.value;
  const selectedPlaybook = watch('playbook');
  const requestOptions = [
    {
      label: t('id-photo.title'),
      value: RequestMoreInfoKind.IdDocument,
    },
    {
      label: t('proof-of-ssn.title'),
      value: RequestMoreInfoKind.ProofOfSsn,
    },
    {
      label: t('proof-of-address.title'),
      value: RequestMoreInfoKind.ProofOfAddress,
    },
    {
      label: t('onboard.title'),
      value: RequestMoreInfoKind.Onboard,
    },
  ];

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
  const getRequestKindError = (option?: RequestKindSelectOption) => {
    if (!option) return t('kind.required-error');
    if (option?.value !== RequestMoreInfoKind.Onboard) {
      if (!hasPriorOnboarding) {
        return t('kind.cannot-request-info');
      }
    }
    return undefined;
  };

  const handleBeforeSubmit = (data: TriggerFormData) => {
    onSubmit(data);
  };

  return (
    <FormProvider {...methods}>
      <StyledForm id={formId} onSubmit={handleSubmit(handleBeforeSubmit)}>
        <Stack direction="column" gap={5}>
          <Controller
            control={control}
            name="kind"
            rules={{
              validate: {
                required: getRequestKindError,
              },
            }}
            render={select => (
              <Select
                label={t('kind.label')}
                options={requestOptions}
                value={select.field.value}
                onChange={select.field.onChange}
                placeholder={t('kind.placeholder')}
                hasError={!!select.fieldState.error}
                hint={select.fieldState.error?.message}
              />
            )}
          />
          <AnimatedContainer
            isExpanded={triggerKind === RequestMoreInfoKind.IdDocument}
          >
            <Toggle
              label={t('id-photo.collect-selfie')}
              checked={watch('collectSelfie')}
              {...register('collectSelfie')}
            />
          </AnimatedContainer>
          <AnimatedContainer
            isExpanded={triggerKind === RequestMoreInfoKind.Onboard}
          >
            {playbooksData?.length ? (
              <Controller
                control={control}
                name="playbook"
                rules={{
                  required: triggerKind === RequestMoreInfoKind.Onboard,
                }}
                render={select => (
                  <Select
                    label={t('onboard.use-playbook')}
                    hasError={!!select.fieldState.error}
                    hint={
                      select.fieldState.error && t('onboard.playbook-required')
                    }
                    placeholder={t('onboard.select-a-playbook')}
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
        </Stack>
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
    gap: ${theme.spacing[5]};
  `}
`;
