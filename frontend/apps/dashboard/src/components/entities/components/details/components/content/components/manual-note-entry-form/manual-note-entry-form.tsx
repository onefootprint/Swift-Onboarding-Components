import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import type { OrgFrequentNoteKind } from '@onefootprint/types';
import { Divider, Toggle, Typography } from '@onefootprint/ui';
import React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import FrequentNotesTextArea from 'src/components/frequent-notes-text-area';

export type ManualNoteFormData = {
  note: string;
  isPinned: boolean;
};

type ManualNoteEntryFormProps = {
  formId: string;
  prompt?: string;
  placeholder?: string;
  onSubmit: (data: ManualNoteFormData) => void;
  frequentNoteKind: OrgFrequentNoteKind;
};

const ManualNoteEntryForm = ({
  formId,
  prompt,
  placeholder,
  onSubmit,
  frequentNoteKind,
}: ManualNoteEntryFormProps) => {
  const { t } = useTranslation('pages.entity.manual-note-entry-form');
  const methods = useForm<ManualNoteFormData>({
    defaultValues: { note: '', isPinned: false },
  });
  const { handleSubmit, control } = methods;
  const handleBeforeSubmit = (data: ManualNoteFormData) => {
    onSubmit({
      ...data,
    });
  };

  return (
    <FormProvider {...methods}>
      <StyledForm id={formId} onSubmit={handleSubmit(handleBeforeSubmit)}>
        {prompt && <Typography variant="label-2">{prompt}</Typography>}
        <FrequentNotesTextArea
          kind={frequentNoteKind}
          formField="note"
          label={t('note.label')}
          placeholder={placeholder}
          required
        />
        <Divider variant="secondary" />
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
      </StyledForm>
    </FormProvider>
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
