import { useTranslation } from '@onefootprint/hooks';
import { IcoMessage16 } from 'icons';
import React, { useState } from 'react';

import SupportDialog from '../support-dialog';
import SupportListItem from '../support-list-item';

const GET_FORM_URL =
  'https://getform.io/f/037045de-1c04-421c-a274-429812dacb45';

const SendFeedback = () => {
  const { t } = useTranslation('components.send-feedback');
  const [showDialog, setShowDialog] = useState(false);

  const handleClickTrigger = () => {
    setShowDialog(true);
  };

  const handleClose = () => {
    setShowDialog(false);
  };

  return (
    <>
      <SupportListItem
        label={t('label')}
        IconComponent={IcoMessage16}
        onClick={handleClickTrigger}
      />
      <SupportDialog
        url={GET_FORM_URL}
        title={t('dialog.title')}
        description={t('dialog.description')}
        open={showDialog}
        onClose={handleClose}
      />
    </>
  );
};

export default SendFeedback;
