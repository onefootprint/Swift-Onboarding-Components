import { useTranslation } from '@onefootprint/hooks';
import { IcoHelp16 } from '@onefootprint/icons';
import React, { useState } from 'react';

import SupportDialog from '../support-dialog';
import SupportListItem from '../support-list-item';

const GET_FORM_URL =
  'https://getform.io/f/7500e0a7-0049-4cea-b1f0-001671e39abd';

const NeedHelp = () => {
  const { t } = useTranslation('components.navigation-footer.need-help');
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
        IconComponent={IcoHelp16}
        onClick={handleClickTrigger}
      />
      <SupportDialog
        title={t('dialog.title')}
        description={t('dialog.description')}
        url={GET_FORM_URL}
        open={showDialog}
        onClose={handleClose}
      />
    </>
  );
};

export default NeedHelp;
