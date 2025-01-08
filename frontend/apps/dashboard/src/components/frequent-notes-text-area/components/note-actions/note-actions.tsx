import type { OrgFrequentNote } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';

import { LinkButton } from '@onefootprint/ui';

type NoteActionsProps = {
  note: OrgFrequentNote;
  showDeleteConfirmation: string | null;
  hasEditPermissions: boolean;
  isAdding: boolean;
  setShowDeleteConfirmation: (id: string | null) => void;
  onDelete: (id: string) => void;
  onUse: (note: OrgFrequentNote) => void;
  confirmPasteID: string | undefined;
};

const NoteActions = ({
  note,
  showDeleteConfirmation,
  hasEditPermissions,
  isAdding,
  setShowDeleteConfirmation,
  onDelete,
  onUse,
  confirmPasteID,
}: NoteActionsProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.frequent-notes' });
  const toDeleteNote = showDeleteConfirmation === note.id;
  if (!hasEditPermissions) return null;

  return (
    <>
      {toDeleteNote ? (
        <div className="flex flex-col w-full gap-1">
          <p className="text-label-3 text-primary">{t('are-you-sure')}</p>
          <p className="text-body-3 text-tertiary">{t('warning')}</p>
          <div className="flex flex-row justify-between w-full mt-1">
            <LinkButton onClick={() => setShowDeleteConfirmation(null)} disabled={isAdding} ariaLabel={t('keep-note')}>
              {t('keep-note')}
            </LinkButton>
            <LinkButton
              className="hidden group-hover:block"
              destructive
              onClick={() => onDelete(note.id)}
              disabled={isAdding}
              ariaLabel={t('confirm-delete')}
            >
              {t('confirm-delete')}
            </LinkButton>
          </div>
        </div>
      ) : (
        <div className="flex justify-between w-full">
          <LinkButton
            onClick={() => onUse(note)}
            disabled={isAdding || !!showDeleteConfirmation}
            ariaLabel={confirmPasteID === note.id ? t('confirm-paste') : t('use-note')}
          >
            {confirmPasteID === note.id ? t('confirm-paste') : t('use-note')}
          </LinkButton>
          <div className="transition-opacity duration-200 opacity-0 group-hover:opacity-100">
            <LinkButton
              destructive
              onClick={() => setShowDeleteConfirmation(note.id)}
              disabled={isAdding || !!showDeleteConfirmation}
              ariaLabel={t('delete')}
            >
              {t('delete')}
            </LinkButton>
          </div>
        </div>
      )}
    </>
  );
};

export default NoteActions;
