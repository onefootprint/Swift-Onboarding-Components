import { useTranslation } from '@onefootprint/hooks';
import { LinkButton } from '@onefootprint/ui';
import React, { useState } from 'react';

import FreeFormNoteEntryDialog from './components/free-form-note-entry-dialog';

const FreeFormNoteAddHeader = () => {
  const { t } = useTranslation(
    'pages.entity.audit-trail.timeline.free-form-note-event',
  );

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <LinkButton size="compact" onClick={handleOpenDialog}>
        {t('add-note-button.title')}
      </LinkButton>
      <FreeFormNoteEntryDialog open={dialogOpen} onClose={handleCloseDialog} />
    </>
  );
};

export default FreeFormNoteAddHeader;
