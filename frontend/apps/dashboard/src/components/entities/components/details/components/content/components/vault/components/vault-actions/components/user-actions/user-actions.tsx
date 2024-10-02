import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import { RoleScopeKind } from '@onefootprint/types';
import { Box, Dropdown, IconButton } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { WithEntityProps } from '@/entity/components/with-entity';
import useTags from '@/entity/hooks/use-tags';
import usePermissions from 'src/hooks/use-permissions';
import useSession from 'src/hooks/use-session';
import DecryptMachineProvider from '../../../../../decrypt-machine';
import { useOpenDatadog } from '../../hooks/use-open-datadog';
import AddToListDialog from '../add-to-list-dialog';
import EditTagsDialog from '../edit-tags-dialog';
import EditVaultDrawer from '../edit-vault-drawer';
import RequestMoreInfoDialog from '../request-more-info-dialog';
import SummarizeAiDialog from '../summarize-ai-dialog';
import UpdateAuthDialog from '../update-auth-dialog';
import UploadDocDialog from '../upload-doc-dialog';
import ViewHistoricalDataDialog from '../view-historical-data-dialog';

enum ActionDialog {
  Auth = 'auth',
  RequestMoreInfo = 'request-more-info',
  AddToList = 'add-to-list',
  HistoricalData = 'historical-data',
  Summarize = 'summarize',
  UploadDoc = 'upload-doc',
  EditTags = 'edit-tags',
  EditVault = 'edit-vault',
}

const DROPDOWN_ITEM_HEIGHT = '32px';

const UserActions = ({ entity }: WithEntityProps) => {
  const { t } = useTranslation('user-details', { keyPrefix: 'header.actions' });
  const { data: tags } = useTags(entity.id);
  const [openDialog, setOpenDialog] = useState<ActionDialog | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const {
    data: { user },
  } = useSession();
  const { hasPermission } = usePermissions();
  const hasLabelAndTagPermissions = hasPermission(RoleScopeKind.labelAndTag);
  const { openDatadog, isEnabled: isOpenDatadogEnabled } = useOpenDatadog();

  const handleCloseDialog = () => {
    setOpenDialog(null);
  };

  const handleDialogOpen = (dialog: ActionDialog) => {
    setDropdownOpen(false);
    setOpenDialog(dialog);
  };

  const handleEditVaultDrawer = () => handleDialogOpen(ActionDialog.EditVault);

  const handleRequestMoreInfo = () => handleDialogOpen(ActionDialog.RequestMoreInfo);

  const handleAuthMethods = () => handleDialogOpen(ActionDialog.Auth);

  const handleAddToList = () => handleDialogOpen(ActionDialog.AddToList);

  const handleSummarize = () => handleDialogOpen(ActionDialog.Summarize);

  const handleUploadDoc = () => handleDialogOpen(ActionDialog.UploadDoc);

  const handleHistoricalData = () => handleDialogOpen(ActionDialog.HistoricalData);

  const handleEditTags = () => handleDialogOpen(ActionDialog.EditTags);

  return (
    <>
      <Dropdown.Root open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <Dropdown.Trigger asChild>
          <IconButton variant="outline" aria-label={t('trigger')} size="compact">
            <Box>
              <IcoDotsHorizontal24 />
            </Box>
          </IconButton>
        </Dropdown.Trigger>
        <Dropdown.Portal>
          <Dropdown.Content align="end" sideOffset={8} minWidth="200px">
            <Dropdown.Group>
              <Dropdown.GroupTitle>{t('management.title')}</Dropdown.GroupTitle>
              {hasPermission(RoleScopeKind.writeEntities) && (
                <Dropdown.Item height={DROPDOWN_ITEM_HEIGHT} onSelect={handleEditVaultDrawer}>
                  {t('management.edit')}
                </Dropdown.Item>
              )}
              {hasLabelAndTagPermissions && (
                <Dropdown.Item height="32px" onSelect={handleEditTags}>
                  {tags?.length ? t('management.edit-tags') : t('management.add-tags')}
                </Dropdown.Item>
              )}
              {hasPermission(RoleScopeKind.writeEntities) && (
                <Dropdown.Item height={DROPDOWN_ITEM_HEIGHT} onSelect={handleUploadDoc}>
                  {t('management.upload-document')}
                </Dropdown.Item>
              )}
              {hasPermission(RoleScopeKind.manualReview) && (
                <Dropdown.Item height={DROPDOWN_ITEM_HEIGHT} onSelect={handleHistoricalData}>
                  {t('management.view-historical-data')}
                </Dropdown.Item>
              )}
              {hasPermission(RoleScopeKind.writeLists) && (
                <Dropdown.Item height={DROPDOWN_ITEM_HEIGHT} onSelect={handleAddToList}>
                  {t('management.add-to-list')}
                </Dropdown.Item>
              )}
              <Dropdown.Item height={DROPDOWN_ITEM_HEIGHT} onSelect={handleSummarize}>
                {t('management.summarize')}
              </Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Divider />
            {hasPermission(RoleScopeKind.manualReview) && (
              <Dropdown.Group>
                <Dropdown.GroupTitle>{t('requests.title')}</Dropdown.GroupTitle>
                <Dropdown.Item height={DROPDOWN_ITEM_HEIGHT} onSelect={handleRequestMoreInfo}>
                  {t('requests.request-more-info')}
                </Dropdown.Item>
                <Dropdown.Item height={DROPDOWN_ITEM_HEIGHT} onSelect={handleAuthMethods}>
                  {t('requests.allow-updating-login-methods')}
                </Dropdown.Item>
              </Dropdown.Group>
            )}
            <Dropdown.Divider />
            {user?.isFirmEmployee && isOpenDatadogEnabled && (
              <Dropdown.Group>
                <Dropdown.GroupTitle>{t('internal.title')}</Dropdown.GroupTitle>
                <Dropdown.Item height={DROPDOWN_ITEM_HEIGHT} onSelect={openDatadog}>
                  {t('internal.datadog')}
                </Dropdown.Item>
              </Dropdown.Group>
            )}
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>
      <DecryptMachineProvider>
        <EditVaultDrawer open={openDialog === ActionDialog.EditVault} onClose={handleCloseDialog} />
      </DecryptMachineProvider>
      <RequestMoreInfoDialog open={openDialog === ActionDialog.RequestMoreInfo} onClose={handleCloseDialog} />
      <UpdateAuthDialog open={openDialog === ActionDialog.Auth} onClose={handleCloseDialog} />
      <AddToListDialog open={openDialog === ActionDialog.AddToList} onClose={handleCloseDialog} />
      <ViewHistoricalDataDialog open={openDialog === ActionDialog.HistoricalData} onClose={handleCloseDialog} />
      <SummarizeAiDialog open={openDialog === ActionDialog.Summarize} onClose={handleCloseDialog} />
      <UploadDocDialog open={openDialog === ActionDialog.UploadDoc} onClose={handleCloseDialog} />
      {hasLabelAndTagPermissions && (
        <EditTagsDialog open={openDialog === ActionDialog.EditTags} onClose={handleCloseDialog} />
      )}
    </>
  );
};

export default UserActions;
