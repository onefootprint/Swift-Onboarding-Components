import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import { EntityKind, RoleScopeKind } from '@onefootprint/types';
import { Dropdown } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate';
import styled, { css } from 'styled-components';

import type { WithEntityProps } from '../../../../../../../with-entity';
import useEditControls from '../../hooks/use-edit-controls';
import AddToListDialog from '../add-to-list-dialog';
import RetriggerKYCDialog from '../retrigger-kyc-dialog';
import UpdateAuthDialog from '../update-auth-dialog';

enum ActionDialog {
  auth,
  retrigger,
  addToList,
}

const Actions = ({ entity }: WithEntityProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.entity.actions' });
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
  // const handleOpenAddToListDialog = () => {
  //   setOpenDialog(ActionDialog.addToList);
  // };

  return shouldShowActionsDropdown ? (
    <>
      <Dropdown.Root>
        <StyledTrigger $asButton aria-label={t('cta')}>
          <IcoDotsHorizontal24 />
        </StyledTrigger>
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
          {/* TODO: uncomment when releasing lists */}
          {/* <Dropdown.Item onSelect={handleOpenAddToListDialog}>
            {t('add-to-list.label')}
          </Dropdown.Item> */}
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
      <AddToListDialog
        open={openDialog === ActionDialog.addToList}
        onClose={handleCloseDialog}
      />
    </>
  ) : null;
};
const StyledTrigger = styled(Dropdown.Trigger)`
  ${({ theme }) => {
    const { button } = theme.components;
    return css`
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: ${button.variant.secondary.boxShadow};

      &:hover {
        box-shadow: ${button.variant.secondary.hover.boxShadow};
      }
    `;
  }}
`;

export default Actions;
