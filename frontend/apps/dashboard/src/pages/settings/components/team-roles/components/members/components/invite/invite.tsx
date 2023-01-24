import { useTranslation } from '@onefootprint/hooks';
import { Box, Button } from '@onefootprint/ui';
import React, { useState } from 'react';

import Dialog from './components/dialog';

const Invite = () => {
  const { t } = useTranslation('pages.settings.members.invite');
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box>
      <Button size="small" variant="secondary" onClick={handleOpen}>
        {t('title')}
      </Button>
      <Dialog onClose={handleClose} open={open} />
    </Box>
  );
};

export default Invite;
