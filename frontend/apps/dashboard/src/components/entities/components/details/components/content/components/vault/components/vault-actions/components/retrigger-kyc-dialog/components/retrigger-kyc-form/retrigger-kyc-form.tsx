import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { IdDI, OrgFrequentNoteKind, TriggerKind } from '@onefootprint/types';
import {
  Checkbox,
  Divider,
  Radio,
  Stack,
  Tooltip,
  Typography,
} from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import AnimatedContainer from 'src/components/animated-container';
import FrequentNotesTextArea from 'src/components/frequent-notes-text-area';
import useSession from 'src/hooks/use-session';

import useEntity from '@/entity/hooks/use-entity';
import useEntityId from '@/entity/hooks/use-entity-id';

export type RetriggerKYCFormData = {
  kind: TriggerKind;
  collectSelfie: boolean;
  note?: string;
};

type RetriggerKYCFormProps = {
  onSubmit: (data: RetriggerKYCFormData) => void;
  formId: string;
};

const RetriggerKYCForm = ({ onSubmit, formId }: RetriggerKYCFormProps) => {
  const { t } = useTranslation('pages.entity.actions.retrigger-kyc');
  const entityId = useEntityId();
  const entity = useEntity(entityId);
  const userHasPhone = entity.data?.attributes?.includes(IdDI.phoneNumber);
  const shouldShowRetriggerKyc = entity.data?.canReonboard;

  const methods = useForm<RetriggerKYCFormData>();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = methods;
  const triggerKind = watch('kind');

  const {
    data: { user },
  } = useSession();

  const handleBeforeSubmit = (data: RetriggerKYCFormData) => {
    onSubmit({
      ...data,
    });
  };

  return (
    <FormProvider {...methods}>
      <StyledForm id={formId} onSubmit={handleSubmit(handleBeforeSubmit)}>
        <Typography variant="label-3">{t('prompt')}</Typography>
        <Stack paddingBottom={2} direction="column" gap={4}>
          <div>
            <Radio
              value={TriggerKind.IdDocument}
              label={t('form.id-photo.title')}
              hint={t('form.id-photo.description')}
              {...register('kind', { required: true })}
            />
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
          <Radio
            value={TriggerKind.ProofOfSsn}
            label={t('form.proof-of-ssn.title')}
            hint={t('form.proof-of-ssn.description')}
            {...register('kind', { required: true })}
          />
          {user?.isFirmEmployee && (
            <div>
              <Radio
                value={TriggerKind.ProofOfAddress}
                label={t('form.proof-of-address.title')}
                hint={t('form.proof-of-address.description')}
                {...register('kind', { required: true })}
              />
            </div>
          )}
          <Tooltip
            disabled={shouldShowRetriggerKyc}
            position="left"
            text={t('form.cannot-reonboard-user')}
          >
            <Radio
              value={TriggerKind.RedoKyc}
              label={t('form.revise-kyc.title')}
              hint={t('form.revise-kyc.description')}
              disabled={!shouldShowRetriggerKyc}
              {...register('kind', { required: true })}
            />
          </Tooltip>
          {errors.kind && (
            <Typography variant="body-4" color="error">
              {t('form.error')}
            </Typography>
          )}
        </Stack>
        <FrequentNotesTextArea
          kind={OrgFrequentNoteKind.Trigger}
          formField="note"
          label={t('form.note-for-user.label')}
          placeholder={t('form.note-for-user.placeholder')}
        />
        <Divider />
        <Typography variant="body-3" color="tertiary">
          {userHasPhone
            ? t('form.description-phone')
            : t('form.description-email')}
        </Typography>
      </StyledForm>
    </FormProvider>
  );
};

export default RetriggerKYCForm;

const StyledForm = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: ${theme.spacing[5]};
  `}
`;
