import useEntityId from '@/entity/hooks/use-entity-id';
import useTags from '@/entity/hooks/use-tags';
import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import { RoleScopeKind } from '@onefootprint/types';
import { Dropdown, IconButton } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useBusinessOwners from 'src/hooks/use-business-owners';
import usePermissions from 'src/hooks/use-permissions';
import EditTagsDialog from '../edit-tags-dialog';
import EditVaultDrawer from '../edit-vault-drawer';
import RequestMoreInfo from './components/request-more-info';

enum ActionDialog {
  RequestMoreInfo = 'request-more-info',
  EditVault = 'edit-vault',
  EditTags = 'edit-tags',
}

const DROPDOWN_ITEM_HEIGHT = '32px';

const BusinessActions = () => {
  const { t } = useTranslation('business-details', { keyPrefix: 'actions' });
  const entityId = useEntityId();
  const tagsQuery = useTags(entityId);
  const bosQuery = useBusinessOwners(entityId);
  const [openDialog, setOpenDialog] = useState<ActionDialog | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { hasPermission } = usePermissions();
  const hasBusinessOwners = !!bosQuery.data?.length;
  const hasLabelAndTagPermissions = hasPermission(RoleScopeKind.labelAndTag);
  const isPending = tagsQuery.isPending || bosQuery.isPending;

  const handleCloseDialog = () => {
    setOpenDialog(null);
  };

  const handleDialogOpen = (dialog: ActionDialog) => () => {
    setDropdownOpen(false);
    setOpenDialog(dialog);
  };

  return (
    <>
      <Dropdown.Root open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <Dropdown.Trigger asChild>
          <IconButton variant="outline" aria-label={t('trigger')} size="compact" disabled={isPending}>
            <IcoDotsHorizontal24 />
          </IconButton>
        </Dropdown.Trigger>
        <Dropdown.Portal>
          <Dropdown.Content align="end" sideOffset={8} minWidth="200px">
            <Dropdown.Group>
              <Dropdown.GroupTitle>{t('management.title')}</Dropdown.GroupTitle>
              {hasPermission(RoleScopeKind.writeEntities) && (
                <Dropdown.Item height={DROPDOWN_ITEM_HEIGHT} onSelect={handleDialogOpen(ActionDialog.EditVault)}>
                  {t('management.edit')}
                </Dropdown.Item>
              )}
              {hasLabelAndTagPermissions && tagsQuery.data && (
                <Dropdown.Item height={DROPDOWN_ITEM_HEIGHT} onSelect={handleDialogOpen(ActionDialog.EditTags)}>
                  {tagsQuery.data.length > 0 ? t('management.edit-tags') : t('management.add-tags')}
                </Dropdown.Item>
              )}
            </Dropdown.Group>
            {hasBusinessOwners && hasPermission(RoleScopeKind.manualReview) && (
              <>
                <Dropdown.Divider />
                <Dropdown.Group>
                  <Dropdown.GroupTitle>{t('requests.title')}</Dropdown.GroupTitle>
                  <Dropdown.Item
                    height={DROPDOWN_ITEM_HEIGHT}
                    onSelect={handleDialogOpen(ActionDialog.RequestMoreInfo)}
                  >
                    {t('requests.request-info')}
                  </Dropdown.Item>
                </Dropdown.Group>
              </>
            )}
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>
      <EditVaultDrawer open={openDialog === ActionDialog.EditVault} onClose={handleCloseDialog} />
      <RequestMoreInfo open={openDialog === ActionDialog.RequestMoreInfo} onClose={handleCloseDialog} />
      {hasLabelAndTagPermissions && (
        <EditTagsDialog open={openDialog === ActionDialog.EditTags} onClose={handleCloseDialog} />
      )}
    </>
  );
};

export default BusinessActions;
