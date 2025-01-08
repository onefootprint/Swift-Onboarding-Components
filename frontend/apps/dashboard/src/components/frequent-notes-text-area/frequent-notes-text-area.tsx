import { useRequestErrorToast } from '@onefootprint/hooks';
import type { OrgFrequentNote } from '@onefootprint/request-types/dashboard';
import type { OrgFrequentNoteKind } from '@onefootprint/types';
import { LinkButton, TextArea as UnstyledTextArea, useToast } from '@onefootprint/ui';
import { cx } from 'class-variance-authority';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import usePermissions from 'src/hooks/use-permissions';
import { AddingCard } from './components/adding-card';
import NoteActions from './components/note-actions';
import useCreateOrgFrequentNote from './hooks/use-create-org-frequent-note';
import useDeleteOrgFrequentNote from './hooks/use-delete-org-frequent-note';
import useOrgFrequentNotes from './hooks/use-org-frequent-notes';

type FrequentNotesTextAreaProps = {
  kind: OrgFrequentNoteKind;
  formField: string;
  label: string;
  placeholder?: string;
  required?: boolean;
};

const FrequentNotesTextArea = ({ kind, formField, label, placeholder, required }: FrequentNotesTextAreaProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.frequent-notes' });
  const { hasPermission } = usePermissions();
  const hasEditPermissions = hasPermission('org_settings');
  const toast = useToast();
  const showRequestErrorToast = useRequestErrorToast();
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [newNoteValue, setNewNoteValue] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<string | null>(null);
  const [value, setValue] = useState('');

  const {
    register,
    formState: { errors },
  } = useFormContext();
  const { ref, ...restOfFormReg } = register(formField, { required });

  const { error, data: notes, ...getQuery } = useOrgFrequentNotes(kind);
  const createMutation = useCreateOrgFrequentNote();
  const deleteMutation = useDeleteOrgFrequentNote();

  const [confirmPaste, setConfirmPaste] = useState<string | undefined>(undefined);

  const isPending = getQuery.isPending || createMutation.isPending || deleteMutation.isPending;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAdding) {
        e.preventDefault();
        e.stopPropagation();
        setIsAdding(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isAdding]);

  const handleSave = () => {
    createMutation.mutate(
      { kind, content: newNoteValue },
      {
        onSuccess: () => {
          toast.show({
            title: t('created-toast.title'),
            description: t('created-toast.description'),
          });
          setIsAdding(false);
          setNewNoteValue('');
        },
        onError: error => {
          showRequestErrorToast(error);
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.show({
          title: t('deleted-toast.title'),
          description: t('deleted-toast.description'),
        });
        setShowDeleteConfirmation(null);
      },
      onError: error => {
        showRequestErrorToast(error);
      },
    });
  };

  const handleUse = (note: OrgFrequentNote) => {
    setConfirmPaste(note.id);
    setValue(note.content);
    textAreaRef.current?.focus();
    setTimeout(() => {
      setConfirmPaste(undefined);
    }, 1000);
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col mb-4">
        <UnstyledTextArea
          label={label}
          className="h-[140px]"
          placeholder={placeholder}
          hasError={!!errors.note}
          hint={errors.note && t('errors.required')}
          value={value}
          disabled={createMutation.isPending}
          onChangeText={setValue}
          ref={e => {
            ref(e);
            textAreaRef.current = e;
          }}
          {...restOfFormReg}
        />
      </div>
      {(error || !!notes?.length) && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-row items-center justify-between mt-3 mr-2">
            <div className="flex flex-col">
              <div className="text-label-3 text-primary">{t('title')}</div>
              <div className="text-body-3 text-secondary">{t('subtitle')}</div>
            </div>
            {hasEditPermissions && (
              <LinkButton
                disabled={isPending || isAdding || !!showDeleteConfirmation}
                onClick={() => setIsAdding(!isAdding)}
                ariaLabel={t('add-note')}
              >
                {t('add-note')}
              </LinkButton>
            )}
          </div>

          <ul className="flex flex-col gap-3">
            <AnimatePresence mode="wait" initial={false}>
              {isAdding && (
                <AddingCard
                  value={newNoteValue}
                  onChange={setNewNoteValue}
                  handleSave={handleSave}
                  handleCancel={() => setIsAdding(false)}
                />
              )}
            </AnimatePresence>
            <AnimatePresence mode="popLayout" initial={false}>
              {notes
                ?.slice()
                .reverse()
                .map(note => {
                  const toDeleteNote = showDeleteConfirmation === note.id;
                  return (
                    <motion.li
                      layout
                      key={note.id}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ duration: 0.2 }}
                      className={cx(
                        'flex flex-col items-start w-full border bg-primary border-solid rounded border-tertiary group',
                        {
                          'bg-secondary pointer-events-none text-quaternary':
                            isAdding || (!!showDeleteConfirmation && !toDeleteNote),
                        },
                      )}
                    >
                      <div className="m-3 overflow-hidden text-left break-words whitespace-pre-wrap text-body-2 line-clamp-4">
                        {note.content}
                      </div>
                      <div className="flex flex-row items-center justify-between w-full p-3 border-t border-dashed border-tertiary">
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.div
                            key={toDeleteNote ? 'delete' : 'actions'}
                            className={cx('w-full', {
                              'flex flex-col gap-1': toDeleteNote,
                              'flex justify-between': !toDeleteNote,
                            })}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.1 }}
                          >
                            <NoteActions
                              note={note}
                              showDeleteConfirmation={showDeleteConfirmation}
                              hasEditPermissions={hasEditPermissions}
                              isAdding={isAdding}
                              setShowDeleteConfirmation={setShowDeleteConfirmation}
                              onDelete={handleDelete}
                              onUse={handleUse}
                              confirmPasteID={confirmPaste}
                            />
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </motion.li>
                  );
                })}
            </AnimatePresence>
          </ul>
        </div>
      )}
    </div>
  );
};

export default FrequentNotesTextArea;
