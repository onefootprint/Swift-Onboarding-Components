import { useRequestErrorToast } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import { type OrgFrequentNoteKind, RoleScopeKind } from '@onefootprint/types';
import { Box, LinkButton, Stack, TextArea as UnstyledTextArea, createText, useToast } from '@onefootprint/ui';
import { AnimatePresence, motion } from 'framer-motion';
import type { ParseKeys } from 'i18next';
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import usePermissions from 'src/hooks/use-permissions';
import styled, { css } from 'styled-components';

import ErrorComponent from './components/error';
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

const FrequentNotesTextArea = ({ kind, formField, label, placeholder, required }: FrequentNotesTextAreaProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.frequent-notes',
  });
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

  const isLoading = getQuery.isLoading || createMutation.isPending || deleteMutation.isPending;
  const hasEditPermissions = hasPermission(RoleScopeKind.orgSettings);
  const showSave = !notes?.find(n => n.content === value) && value;

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

  const appearHorizontal = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const appearCenter = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <Stack direction="column">
      <Stack direction="column">
        <TextArea
          label={label}
          placeholder={placeholder}
          hasError={!!errors.note}
          hint={errors.note && t('errors.required')}
          value={value}
          disabled={createMutation.isPending}
          onChangeText={handleChangeText}
          ref={e => {
            // https://www.react-hook-form.com/faqs/#Howtosharerefusage
            ref(e);
            textAreaRef.current = e;
          }}
          {...restOfFormReg}
        />
        <Box marginBottom={4} />

        {hasEditPermissions && (
          <Stack marginBottom={5}>
            <LinkButton disabled={isLoading || !showSave} onClick={handleSave}>
              {t('save')}
            </LinkButton>
          </Stack>
        )}
      </Stack>
      <AnimatePresence initial={false}>
        {(error || !!notes?.length) && (
          <motion.span
            variants={appearCenter}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.1 }}
          >
            <Stack direction="column" gap={3}>
              <Stack direction="row" justify="space-between" align="center" marginRight={2} marginTop={3}>
                <Title>{t('title')}</Title>
                {hasEditPermissions && (
                  <LinkButton disabled={isLoading} onClick={() => setIsEdit(!isEdit)}>
                    {t(`${isEdit ? 'done' : 'edit'}` as ParseKeys<'common'>)}
                  </LinkButton>
                )}
              </Stack>
              {error && <ErrorComponent message={getErrorMessage(error)} />}
              <AnimatePresence initial={false}>
                {notes?.map(note => (
                  <motion.span
                    variants={appearHorizontal}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.15 }}
                    key={note.id}
                  >
                    <Option
                      value={note.id}
                      onClick={handleOptionClick}
                      isEdit={isEdit}
                      onDelete={() => {
                        deleteFrequentNote(note.id);
                      }}
                    >
                      {note.content}
                    </Option>
                  </motion.span>
                ))}
              </AnimatePresence>
            </Stack>
          </motion.span>
        )}
      </AnimatePresence>
    </Stack>
  );
};

const Title = styled.div`
  ${({ theme }) => {
    const { label } = theme.components;
    return css`
      ${createText(label.size.default.typography)}
      color: ${label.states.default.color};
    `;
  }}
`;

export default FrequentNotesTextArea;
