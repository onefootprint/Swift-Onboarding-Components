import { Button } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate/';

import FreeFormNoteEntryDialog from './components/free-form-note-entry-dialog';

const AddFreeFormNote = () => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'audit-trail.free-form-note',
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <PermissionGate
        fallbackText={t('add-note-button.cta-not-allowed')}
        scopeKind="manual_review"
        tooltipPosition="bottom"
      >
        <Button onClick={handleOpenDialog} size="compact" variant="secondary">
          {t('add-note-button.title')}
        </Button>
      </PermissionGate>
      <FreeFormNoteEntryDialog open={dialogOpen} onClose={handleCloseDialog} />
    </>
  );
};

export default AddFreeFormNote;
