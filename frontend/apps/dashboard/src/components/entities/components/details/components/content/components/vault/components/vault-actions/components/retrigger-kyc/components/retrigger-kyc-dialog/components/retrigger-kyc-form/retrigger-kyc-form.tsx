import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { TriggerKind } from '@onefootprint/types';
import {
  Checkbox,
  Divider,
  Radio,
  TextArea,
  Typography,
} from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import AnimatedContainer from 'src/components/animated-container';

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
  const { t } = useTranslation('pages.entity.retrigger-kyc.dialog');
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RetriggerKYCFormData>();
  const triggerKind = watch('kind');

  const handleBeforeSubmit = (data: RetriggerKYCFormData) => {
    onSubmit({
      ...data,
    });
  };

  return (
    <StyledForm id={formId} onSubmit={handleSubmit(handleBeforeSubmit)}>
      <Typography variant="label-3">{t('prompt')}</Typography>
      <div>
        <Radio
          value={TriggerKind.IdDocument}
          label={t('form.id-photo.title')}
          hint={t('form.id-photo.description')}
          {...register('kind', { required: true })}
        />
        <AnimatedContainer
          isExpanded={triggerKind === TriggerKind.IdDocument}
          sx={{ marginLeft: 8, marginTop: 4 }}
        >
          <Checkbox
            label={t('form.id-photo.collect-selfie')}
            {...register('collectSelfie', { required: false })}
          />
        </AnimatedContainer>
      </div>
      <Radio
        value={TriggerKind.RedoKyc}
        label={t('form.revise-kyc.title')}
        hint={t('form.revise-kyc.description')}
        {...register('kind', { required: true })}
      />
      {errors.kind && (
        <Typography variant="body-4" color="error">
          {t('form.error')}
        </Typography>
      )}
      <TextArea
        label={t('form.note-for-user.label')}
        placeholder={t('form.note-for-user.placeholder')}
        {...register('note')}
      />
      <Divider />
      <Typography variant="body-3" color="tertiary">
        {t('form.description')}
      </Typography>
    </StyledForm>
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
