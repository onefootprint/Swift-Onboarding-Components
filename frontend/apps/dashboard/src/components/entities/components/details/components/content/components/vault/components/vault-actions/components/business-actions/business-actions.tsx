import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import { RoleScopeKind } from '@onefootprint/types';
import { Box, Dropdown, IconButton } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import usePermissions from 'src/hooks/use-permissions';
import EditVaultDrawer from '../edit-vault-drawer';
import RequestMoreInfoDialog from './components/request-more-';

enum ActionDialog {
  RequestMoreInfo = 'request-more-info',
  EditVault = 'edit-vault',
}

const DROPDOWN_ITEM_HEIGHT = '32px';

const BusinessActions = () => {
  const { t } = useTranslation('business-details', { keyPrefix: 'header.actions' });
  const [openDialog, setOpenDialog] = useState<ActionDialog | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { hasPermission } = usePermissions();

  const handleCloseDialog = () => {
    setOpenDialog(null);
  };

  const handleEditVault = () => {
    setDropdownOpen(false);
    setOpenDialog(ActionDialog.EditVault);
  };

  // const handleRequestMoreInfo = () => {
  //   setDropdownOpen(false);
  //   setOpenDialog(ActionDialog.RequestMoreInfo);
  // };

  return (
    <>
      <Dropdown.Root open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <Dropdown.Trigger>
          <IconButton variant="outline" aria-label={t('trigger')} size="compact">
            <Box>
              <IcoDotsHorizontal24 />
            </Box>
          </IconButton>
        </Dropdown.Trigger>
        <Dropdown.Portal>
          <Dropdown.Content align="end" sideOffset={8} minWidth="200px">
            {hasPermission(RoleScopeKind.writeEntities) && (
              <Dropdown.Item height={DROPDOWN_ITEM_HEIGHT} onSelect={handleEditVault}>
                {t('edit')}
              </Dropdown.Item>
            )}
            {/* {hasPermission(RoleScopeKind.manualReview) && (
              <Dropdown.Item height={DROPDOWN_ITEM_HEIGHT} onSelect={handleRequestMoreInfo}>
                {t('request-info')}
              </Dropdown.Item>
            )} */}
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>
      <EditVaultDrawer open={openDialog === ActionDialog.EditVault} onClose={handleCloseDialog} />
      <RequestMoreInfoDialog open={openDialog === ActionDialog.RequestMoreInfo} onClose={handleCloseDialog} />
    </>
  );
};

export default BusinessActions;
