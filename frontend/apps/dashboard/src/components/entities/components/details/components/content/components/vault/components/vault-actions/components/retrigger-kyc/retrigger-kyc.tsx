import { useTranslation } from '@onefootprint/hooks';
import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import { EntityKind } from '@onefootprint/types';
import { Dropdown } from '@onefootprint/ui';
import React, { useState } from 'react';

import type { WithEntityProps } from '../../../../../../../with-entity';
import RetriggerKYCDialog from './components/retrigger-kyc-dialog';

const RetriggerKYC = ({ entity }: WithEntityProps) => {
  const { t } = useTranslation('pages.entity.retrigger-kyc');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const shouldShowActionsDropdown =
    entity?.isPortable && entity.kind === EntityKind.person;
  return shouldShowActionsDropdown ? (
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
