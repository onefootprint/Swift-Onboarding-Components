import { useTranslation } from 'hooks';
import { IcoHelp16 } from 'icons';
import React, { useState } from 'react';

import SupportDialog, { SupportFormData } from '../support-dialog';
import SupportListItem from '../support-list-item';

const NeedHelp = () => {
  const { t } = useTranslation('components.need-help');
  const [showDialog, setShowDialog] = useState(false);

  const handleClickTrigger = () => {
    setShowDialog(true);
  };

  const handleClose = () => {
    setShowDialog(false);
  };

  const handleSubmit = (data: SupportFormData) => {
    // TODO: implement creating a support ticket from docs page
    console.log(data);
    handleClose();
  };

  return (
    <>
      <SupportListItem
        label={t('label')}
        IconComponent={IcoHelp16}
        onClick={handleClickTrigger}
      />
      <SupportDialog
        title={t('dialog.title')}
        description={t('dialog.description')}
        open={showDialog}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default NeedHelp;
