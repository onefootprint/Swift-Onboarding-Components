import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import { RoleScopeKind } from '@onefootprint/types';
import { Box, Dropdown, IconButton } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import useEntityId from '@/entity/hooks/use-entity-id';

import useBusinessOwners from 'src/hooks/use-business-owners';
import usePermissions from 'src/hooks/use-permissions';
import EditVaultDrawer from '../edit-vault-drawer';
import RequestMoreInfo from './components/request-more-info';

enum ActionDialog {
  RequestMoreInfo = 'request-more-info',
  EditVault = 'edit-vault',
}

const DROPDOWN_ITEM_HEIGHT = '32px';

const BusinessActions = () => {
  const { t } = useTranslation('business-details', { keyPrefix: 'actions' });
  const entityId = useEntityId();
  const bosQuery = useBusinessOwners(entityId);
  const [openDialog, setOpenDialog] = useState<ActionDialog | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { hasPermission } = usePermissions();
  const hasBusinessOwners = !!bosQuery.data?.length;

  const handleCloseDialog = () => {
    setOpenDialog(null);
  };

  const handleEditVault = () => {
    setDropdownOpen(false);
    setOpenDialog(ActionDialog.EditVault);
  };

  const handleRequestMoreInfo = () => {
    setDropdownOpen(false);
    setOpenDialog(ActionDialog.RequestMoreInfo);
  };

  return (
    <>
      <Dropdown.Root open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <Dropdown.Trigger>
          <IconButton variant="outline" aria-label={t('trigger')} size="compact" disabled={bosQuery.isPending}>
            <Box>
              <IcoDotsHorizontal24 />
            </Box>
          </IconButton>
        </Dropdown.Trigger>
        <Dropdown.Portal>
          <Dropdown.Content align="end" sideOffset={8} minWidth="200px">
            <Dropdown.Group>
              {hasPermission(RoleScopeKind.writeEntities) && (
                <Dropdown.Item height={DROPDOWN_ITEM_HEIGHT} onSelect={handleEditVault}>
                  {t('edit')}
                </Dropdown.Item>
              )}
              {hasBusinessOwners && hasPermission(RoleScopeKind.manualReview) && (
                <Dropdown.Item height={DROPDOWN_ITEM_HEIGHT} onSelect={handleRequestMoreInfo}>
                  {t('request-info')}
                </Dropdown.Item>
              )}
            </Dropdown.Group>
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>
      <EditVaultDrawer open={openDialog === ActionDialog.EditVault} onClose={handleCloseDialog} />
      <RequestMoreInfo open={openDialog === ActionDialog.RequestMoreInfo} onClose={handleCloseDialog} />
    </>
  );
};

export default BusinessActions;
