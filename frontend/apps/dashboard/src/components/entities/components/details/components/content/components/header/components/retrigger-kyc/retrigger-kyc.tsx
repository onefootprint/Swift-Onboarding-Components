import { useTranslation } from '@onefootprint/hooks';
import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import { Dropdown } from '@onefootprint/ui';
import React, { useState } from 'react';
import useSession from 'src/hooks/use-session';

import RetriggerKYCDialog from './components/retrigger-kyc-dialog';

const RetriggerKYC = () => {
  const { t } = useTranslation('pages.entity.retrigger-kyc');
  const {
    data: { user },
  } = useSession();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  return user?.isFirmEmployee ? (
    <>
      <Dropdown.Root>
        <Dropdown.Trigger $asButton aria-label={t('cta')}>
          <IcoDotsHorizontal24 />
        </Dropdown.Trigger>
        <Dropdown.Content align="end" sideOffset={8}>
          <Dropdown.Item onSelect={handleOpenDialog}>
            {t('option')}
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Root>
      <RetriggerKYCDialog open={dialogOpen} onClose={handleCloseDialog} />
    </>
  ) : null;
};

export default RetriggerKYC;
