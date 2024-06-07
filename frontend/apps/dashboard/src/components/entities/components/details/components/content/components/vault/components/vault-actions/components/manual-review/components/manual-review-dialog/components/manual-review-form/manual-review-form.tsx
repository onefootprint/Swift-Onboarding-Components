import type { ReviewStatus } from '@onefootprint/types';
import { Divider, Text, TextArea, Toggle } from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

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
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.manual-review',
  });
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
    <StyledForm id="manual-review-form" onSubmit={handleSubmit(handleBeforeSubmit)}>
      <Text variant="label-2">{t('dialog.form.prompt', { status: t(`status.${status}`) })}</Text>
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
            />
          </ToggleContainer>
        )}
      />
      <Divider />
      <Text variant="body-3" color="tertiary">
        {t('dialog.form.disclaimer')}
      </Text>
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
