import { useTranslation } from '@onefootprint/hooks';
import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import { EntityKind } from '@onefootprint/types';
import { Dropdown } from '@onefootprint/ui';
import React, { useState } from 'react';

import type { WithEntityProps } from '../../../../../../../with-entity';
import useEditControls from '../../hooks/use-edit-controls';
import RetriggerKYCDialog from '../retrigger-kyc-dialog';

const Actions = ({ entity }: WithEntityProps) => {
  const { t } = useTranslation('pages.entity.actions');
  const editControls = useEditControls();
  const [dialogOpen, setDialogOpen] = useState(false);

  const shouldShowActionsDropdown = entity.kind === EntityKind.person;
  const shouldShowRetriggerKyc = entity?.isPortable;

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  return shouldShowActionsDropdown ? (
    <>
      <Dropdown.Root>
        <Dropdown.Trigger $asButton aria-label={t('cta')}>
          <IcoDotsHorizontal24 />
        </Dropdown.Trigger>
        <Dropdown.Content align="end" sideOffset={8}>
          <Dropdown.Item onSelect={editControls.start}>
            {t('edit-user.label')}
          </Dropdown.Item>
          {shouldShowRetriggerKyc && (
            <Dropdown.Item onSelect={handleOpenDialog}>
              {t('retrigger-kyc.label')}
            </Dropdown.Item>
          )}
        </Dropdown.Content>
      </Dropdown.Root>
      <RetriggerKYCDialog open={dialogOpen} onClose={handleCloseDialog} />
    </>
  ) : null;
};

export default Actions;
