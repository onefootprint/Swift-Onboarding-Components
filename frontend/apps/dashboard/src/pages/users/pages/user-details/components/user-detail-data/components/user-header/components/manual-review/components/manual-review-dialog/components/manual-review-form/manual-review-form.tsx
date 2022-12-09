import { useTranslation } from '@onefootprint/hooks';
import { ReviewStatus } from '@onefootprint/types';
import {
  Divider,
  Select,
  SelectOption,
  TextArea,
  Toggle,
  Typography,
} from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

export type ManualReviewFormData = {
  reason: string;
  note: string;
  isPinned: boolean;
};

type FormData = {
  reason: SelectOption;
  note: string;
  isPinned: boolean;
};

type ManualReviewFormProps = {
  status: ReviewStatus;
  onSubmit: (data: ManualReviewFormData) => void;
};

const ManualReviewForm = ({ status, onSubmit }: ManualReviewFormProps) => {
  const { t } = useTranslation('pages.user-details.manual-review');
  const { register, handleSubmit, control } = useForm<FormData>({
    defaultValues: { note: '', isPinned: false },
  });
  const handleBeforeSubmit = (data: FormData) => {
    onSubmit({
      ...data,
      reason: data.reason.value,
    });
  };

  return (
    <StyledForm
      id="manual-review-form"
      onSubmit={handleSubmit(handleBeforeSubmit)}
    >
      <Typography variant="label-2">
        {t('dialog.form.prompt', { status: t(`status.${status}`) })}
      </Typography>
      <Controller
        control={control}
        name="reason"
        rules={{ required: true }}
        render={({ field, fieldState }) => (
          <Select
            label={t('dialog.form.reason.label')}
            hasError={!!fieldState.error}
            hint={fieldState.error && t('dialog.form.reason.errors.required')}
            onBlur={field.onBlur}
            onChange={field.onChange}
            options={[
              {
                value: t('dialog.form.reason.options.identity-theft'),
                label: t('dialog.form.reason.options.identity-theft'),
              },
              {
                value: t(
                  'dialog.form.reason.options.could-not-verify-identity',
                ),
                label: t(
                  'dialog.form.reason.options.could-not-verify-identity',
                ),
              },
            ]}
            value={field.value}
          />
        )}
      />
      <TextArea
        label={t('dialog.form.note.label')}
        placeholder={t('dialog.form.note.placeholder')}
        {...register('note')}
      />
      <Controller
        control={control}
        name="isPinned"
        render={({ field }) => (
          <ToggleContainer>
            <Toggle
              onBlur={field.onBlur}
              onChange={nextValue => {
                field.onChange(nextValue);
              }}
              checked={field.value}
              label={t('dialog.form.toggle.label')}
              labelPlacement="right"
            />
          </ToggleContainer>
        )}
      />
      <Divider />
      <Typography variant="body-3" color="tertiary">
        {t('dialog.form.disclaimer')}
      </Typography>
    </StyledForm>
  );
};

const ToggleContainer = styled.div`
  width: 100%;
  display: flex;
`;

const StyledForm = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justift-content: flex-start;
    gap: ${theme.spacing[7]};
  `}
`;

export default ManualReviewForm;
