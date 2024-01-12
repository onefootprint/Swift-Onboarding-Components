import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import styled, { css } from '@onefootprint/styled';
import { type OrgFrequentNoteKind, RoleScopeKind } from '@onefootprint/types';
import {
  LinkButton,
  Stack,
  TextArea as UnstyledTextArea,
  Typography,
  useToast,
} from '@onefootprint/ui';
import React, { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import usePermissions from 'src/hooks/use-permissions';

import Error from './components/error';
import Option from './components/option';
import useCreateOrgFrequentNote from './hooks/use-create-org-frequent-note';
import useDeleteOrgFrequentNote from './hooks/use-delete-org-frequent-note';
import useOrgFrequentNotes from './hooks/use-org-frequent-notes';

const TextArea = styled(UnstyledTextArea)`
  ${() => css`
    height: 140px;
  `}
`;

type FrequentNotesTextAreaProps = {
  kind: OrgFrequentNoteKind;
  formField: string;
  label: string;
  placeholder?: string;
  required?: boolean;
};

const FrequentNotesTextArea = ({
  kind,
  formField,
  label,
  placeholder,
  required,
}: FrequentNotesTextAreaProps) => {
  const { t } = useTranslation('components.frequent-notes');
  const { hasPermission } = usePermissions();

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const toast = useToast();
  const showRequestErrorToast = useRequestErrorToast();

  const {
    register,
    formState: { errors },
  } = useFormContext();
  const formReg = register(formField, { required });
  const { ref, ...restOfFormReg } = formReg;

  const { error, data: notes, ...getQuery } = useOrgFrequentNotes(kind);
  const createMutation = useCreateOrgFrequentNote();
  const deleteMutation = useDeleteOrgFrequentNote();

  const [value, setValue] = useState<string>('');
  const handleChangeText = (nextValue: string) => {
    setValue(nextValue);
  };

  useEffect(() => {
    if (!notes?.length) {
      setIsEdit(false);
    }
  }, [notes]);

  const isLoading =
    getQuery.isLoading || createMutation.isLoading || deleteMutation.isLoading;
  const hasEditPermissions = hasPermission(RoleScopeKind.orgSettings);
  const showSave = !(notes && notes.find(n => n.content === value));

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const handleOptionClick = (body: string) => {
    // clicking in option should not trigger onChange event
    setValue(body);

    if (textAreaRef?.current) {
      textAreaRef.current.focus();
    }
  };

  const handleSave = () => {
    createMutation.mutate(
      {
        kind,
        content: value,
      },
      {
        onSuccess: () => {
          toast.show({
            title: t('created-toast.title'),
            description: t('created-toast.description'),
          });
        },
        onError: showRequestErrorToast,
      },
    );
  };

  const deleteFrequentNote = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.show({
          title: t('deleted-toast.title'),
          description: t('deleted-toast.description'),
        });
      },
      onError: showRequestErrorToast,
    });
  };

  return (
    <Stack direction="column" gap={5}>
      <TextArea
        label={label}
        placeholder={placeholder}
        hasError={!!errors.note}
        hint={errors.note && t('errors.required')}
        value={value}
        disabled={createMutation.isLoading}
        onChangeText={handleChangeText}
        ref={e => {
          // https://www.react-hook-form.com/faqs/#Howtosharerefusage
          ref(e);
          textAreaRef.current = e;
        }}
        {...restOfFormReg}
      />
      {hasEditPermissions && (
        <LinkButton
          disabled={isLoading || !showSave || !value}
          onClick={handleSave}
        >
          {t('save')}
        </LinkButton>
      )}
      {(error || !!notes?.length) && (
        <Stack direction="column" gap={3}>
          <Stack direction="row" justify="space-between" align="center">
            <Typography variant="label-3">{t('title')}</Typography>
            {hasEditPermissions && (
              <LinkButton
                disabled={isLoading}
                onClick={() => setIsEdit(!isEdit)}
                size="compact"
              >
                {t(`${isEdit ? 'done' : 'edit'}`)}
              </LinkButton>
            )}
          </Stack>
          {error && <Error message={getErrorMessage(error)} />}
          {notes &&
            notes.map(note => (
              <Option
                key={note.id}
                value={note.id}
                onClick={handleOptionClick}
                isEdit={isEdit}
                onDelete={() => {
                  deleteFrequentNote(note.id);
                }}
              >
                {note.content}
              </Option>
            ))}
        </Stack>
      )}
    </Stack>
  );
};

export default FrequentNotesTextArea;
