import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import type { ReviewStatus } from '@onefootprint/types';
import { Divider, TextArea, Toggle, Typography } from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

export type ManualReviewFormData = {
  note: string;
  isPinned: boolean;
};

type FormData = {
  note: string;
  isPinned: boolean;
};

type ManualReviewFormProps = {
  status: ReviewStatus;
  onSubmit: (data: ManualReviewFormData) => void;
};

const ManualReviewForm = ({ status, onSubmit }: ManualReviewFormProps) => {
  const { t } = useTranslation('pages.entity.manual-review');
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { note: '', isPinned: false },
  });
  const handleBeforeSubmit = (data: FormData) => {
    onSubmit({
      ...data,
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
      <TextArea
        label={t('dialog.form.note.label')}
        placeholder={t('dialog.form.note.placeholder')}
        hasError={!!errors.note}
        hint={errors.note && t('dialog.form.note.errors.required')}
        {...register('note', { required: true })}
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
