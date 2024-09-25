import type { OrgFrequentNoteKind } from '@onefootprint/types';
import { Divider, Text, Toggle } from '@onefootprint/ui';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FrequentNotesTextArea from 'src/components/frequent-notes-text-area';
import styled, { css } from 'styled-components';

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

const ManualNoteEntryForm = ({ formId, prompt, placeholder, onSubmit, frequentNoteKind }: ManualNoteEntryFormProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'manual-note-entry-form',
  });
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
        {prompt && <Text variant="label-2">{prompt}</Text>}
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
