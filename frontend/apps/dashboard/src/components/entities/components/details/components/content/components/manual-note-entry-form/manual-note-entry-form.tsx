import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Divider, TextArea, Toggle, Typography } from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

export type ManualNoteFormData = {
  note: string;
  isPinned: boolean;
};

type ManualNoteEntryFormProps = {
  formId: string;
  prompt?: string;
  placeholder?: string;
  onSubmit: (data: ManualNoteFormData) => void;
};

const ManualNoteEntryForm = ({
  formId,
  prompt,
  placeholder,
  onSubmit,
}: ManualNoteEntryFormProps) => {
  const { t } = useTranslation('pages.entity.manual-note-entry-form');
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ManualNoteFormData>({
    defaultValues: { note: '', isPinned: false },
  });
  const handleBeforeSubmit = (data: ManualNoteFormData) => {
    onSubmit({
      ...data,
    });
  };

  return (
    <StyledForm id={formId} onSubmit={handleSubmit(handleBeforeSubmit)}>
      {prompt && <Typography variant="label-2">{prompt}</Typography>}
      <TextArea
        label={t('note.label')}
        placeholder={placeholder}
        hasError={!!errors.note}
        hint={errors.note && t('note.errors.required')}
        {...register('note', { required: true })}
      />
      {/* replace TextArea for this component once we have the backend for frequent notes ready */}
      {/* <FrequentNotesTextArea
        textAreaProps={{
          label: t('note.label'),
          placeholder,
          hasError: !!errors.note,
          hint: errors.note && t('note.errors.required'),
          ...register('note', { required: true }),
        }}
      /> */}
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
              label={t('toggle.label')}
            />
          </ToggleContainer>
        )}
      />
      <Divider />
      <Typography variant="body-3" color="tertiary">
        {t('disclaimer')}
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

export default ManualNoteEntryForm;
