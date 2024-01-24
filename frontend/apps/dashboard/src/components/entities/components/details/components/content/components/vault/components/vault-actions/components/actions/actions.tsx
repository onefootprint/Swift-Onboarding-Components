import { useTranslation } from '@onefootprint/hooks';
import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import { EntityKind, RoleScopeKind } from '@onefootprint/types';
import { Dropdown } from '@onefootprint/ui';
import React, { useState } from 'react';
import PermissionGate from 'src/components/permission-gate';

import type { WithEntityProps } from '../../../../../../../with-entity';
import useEditControls from '../../hooks/use-edit-controls';
import RetriggerKYCDialog from '../retrigger-kyc-dialog';
import UpdateAuthDialog from '../update-auth-dialog';

enum ActionDialog {
  auth,
  retrigger,
}

const Actions = ({ entity }: WithEntityProps) => {
  const { t } = useTranslation('pages.entity.actions');
  const editControls = useEditControls();
  const [openDialog, setOpenDialog] = useState<ActionDialog | null>(null);

  const shouldShowActionsDropdown = entity.kind === EntityKind.person;

  const handleCloseDialog = () => {
    setOpenDialog(null);
  };
  const handleOpenRetriggerKycDialog = () => {
    setOpenDialog(ActionDialog.retrigger);
  };
  const handleOpenAuthMethodsDialog = () => {
    setOpenDialog(ActionDialog.auth);
  };

  return shouldShowActionsDropdown ? (
    <>
      <Dropdown.Root>
        <Dropdown.Trigger $asButton aria-label={t('cta')}>
          <IcoDotsHorizontal24 />
        </Dropdown.Trigger>
        <Dropdown.Content align="end" sideOffset={8}>
          <PermissionGate
            scopeKind={RoleScopeKind.writeEntities}
            fallbackText={t('edit-user.not-allowed')}
          >
            <Dropdown.Item onSelect={editControls.start}>
              {t('edit-user.label')}
            </Dropdown.Item>
          </PermissionGate>
          <PermissionGate
            scopeKind={RoleScopeKind.manualReview}
            fallbackText={t('retrigger-kyc.not-allowed')}
          >
            <Dropdown.Item onSelect={handleOpenRetriggerKycDialog}>
              {t('retrigger-kyc.label')}
            </Dropdown.Item>
          </PermissionGate>
          <PermissionGate
            scopeKind={RoleScopeKind.manualReview}
            fallbackText={t('update-auth-methods.not-allowed')}
          >
            <Dropdown.Item onSelect={handleOpenAuthMethodsDialog}>
              {t('update-auth-methods.label')}
            </Dropdown.Item>
          </PermissionGate>
        </Dropdown.Content>
      </Dropdown.Root>
      <RetriggerKYCDialog
        open={openDialog === ActionDialog.retrigger}
        onClose={handleCloseDialog}
      />
      <UpdateAuthDialog
        open={openDialog === ActionDialog.auth}
        onClose={handleCloseDialog}
      />
    </>
  ) : null;
};

export default Actions;
