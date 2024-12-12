import useEntityId from '@/entity/hooks/use-entity-id';
import useTags from '@/entity/hooks/use-entity-tags';
import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import { Dropdown, IconButton } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useBusinessOwners from 'src/hooks/use-business-owners';
import usePermissions from 'src/hooks/use-permissions';
import EditTagsDialog from '../edit-tags-dialog';
import EditVaultDrawer from '../edit-vault-drawer';
import UploadDocDialog from '../upload-doc-dialog';
import RequestMoreInfo from './components/request-more-info';

enum ActionDialog {
  EditTags = 'edit-tags',
  EditVault = 'edit-vault',
  RequestMoreInfo = 'request-more-info',
  UploadDoc = 'upload-doc',
}

const BusinessActions = () => {
  const { t } = useTranslation('business-details', { keyPrefix: 'actions' });
  const entityId = useEntityId();
  const tagsQuery = useTags(entityId);
  const bosQuery = useBusinessOwners(entityId);
  const [openDialog, setOpenDialog] = useState<ActionDialog | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { hasPermission } = usePermissions();
  const hasBusinessOwners = !!bosQuery.data?.length;
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
          <div>
            <IconButton variant="outline" aria-label={t('trigger')} size="compact" disabled={isPending}>
              <IcoDotsHorizontal24 />
            </IconButton>
          </div>
        </Dropdown.Trigger>
        <Dropdown.Portal>
          <Dropdown.Content align="end" sideOffset={8} minWidth="200px">
            <Dropdown.Group>
              <Dropdown.GroupTitle>{t('management.title')}</Dropdown.GroupTitle>
              {hasPermission('write_entities') && (
                <div className="h-8">
                  <Dropdown.Item onSelect={handleDialogOpen(ActionDialog.EditVault)}>
                    {t('management.edit')}
                  </Dropdown.Item>
                </div>
              )}
              {hasPermission('label_and_tag') && tagsQuery.data && (
                <div className="h-8">
                  <Dropdown.Item onSelect={handleDialogOpen(ActionDialog.EditTags)}>
                    {tagsQuery.data.length > 0 ? t('management.edit-tags') : t('management.add-tags')}
                  </Dropdown.Item>
                </div>
              )}
              {hasPermission('write_entities') && (
                <div className="h-8">
                  <Dropdown.Item onSelect={handleDialogOpen(ActionDialog.UploadDoc)}>
                    {t('management.upload-document')}
                  </Dropdown.Item>
                </div>
              )}
            </Dropdown.Group>
            {hasBusinessOwners && hasPermission('manual_review') && (
              <>
                <Dropdown.Divider />
                <Dropdown.Group>
                  <Dropdown.GroupTitle>{t('requests.title')}</Dropdown.GroupTitle>
                  <div className="h-8">
                    <Dropdown.Item onSelect={handleDialogOpen(ActionDialog.RequestMoreInfo)}>
                      {t('requests.request-info')}
                    </Dropdown.Item>
                  </div>
                </Dropdown.Group>
              </>
            )}
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>
      {hasPermission('write_entities') && (
        <EditVaultDrawer open={openDialog === ActionDialog.EditVault} onClose={handleCloseDialog} />
      )}
      {hasPermission('manual_review') && (
        <RequestMoreInfo open={openDialog === ActionDialog.RequestMoreInfo} onClose={handleCloseDialog} />
      )}
      {hasPermission('label_and_tag') && (
        <EditTagsDialog open={openDialog === ActionDialog.EditTags} onClose={handleCloseDialog} />
      )}
      {hasPermission('write_entities') && (
        <UploadDocDialog open={openDialog === ActionDialog.UploadDoc} onClose={handleCloseDialog} />
      )}
    </>
  );
};

export default BusinessActions;
