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

  const handleDialogOpen = (dialog: ActionDialog) => () => {
    setDropdownOpen(false);
    setOpenDialog(dialog);
  };

  return (
    <>
      <Dropdown.Root open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <Dropdown.Trigger asChild>
          <Box>
            <IconButton variant="outline" aria-label={t('trigger')} size="compact">
              <IcoDotsHorizontal24 />
            </IconButton>
          </Box>
        </Dropdown.Trigger>
        <Dropdown.Content align="end" sideOffset={8} minWidth="200px">
          <Dropdown.Group>
            <Dropdown.GroupTitle>{t('management.title')}</Dropdown.GroupTitle>
            {hasPermission(RoleScopeKind.writeEntities) && (
              <Dropdown.Item
                key="edit-vault"
                height={DROPDOWN_ITEM_HEIGHT}
                onSelect={handleDialogOpen(ActionDialog.EditVault)}
              >
                {t('management.edit')}
              </Dropdown.Item>
            )}
            {hasLabelAndTagPermissions && (
              <Dropdown.Item key="edit-tags" height="32px" onSelect={handleDialogOpen(ActionDialog.EditTags)}>
                {tags?.length ? t('management.edit-tags') : t('management.add-tags')}
              </Dropdown.Item>
            )}
            {hasPermission(RoleScopeKind.writeEntities) && (
              <Dropdown.Item
                key="upload-doc"
                height={DROPDOWN_ITEM_HEIGHT}
                onSelect={handleDialogOpen(ActionDialog.UploadDoc)}
              >
                {t('management.upload-document')}
              </Dropdown.Item>
            )}
            {hasPermission(RoleScopeKind.manualReview) && (
              <Dropdown.Item
                key="historical-data"
                height={DROPDOWN_ITEM_HEIGHT}
                onSelect={handleDialogOpen(ActionDialog.HistoricalData)}
              >
                {t('management.view-historical-data')}
              </Dropdown.Item>
            )}
            {hasPermission(RoleScopeKind.writeLists) && (
              <Dropdown.Item
                key="add-to-list"
                height={DROPDOWN_ITEM_HEIGHT}
                onSelect={handleDialogOpen(ActionDialog.AddToList)}
              >
                {t('management.add-to-list')}
              </Dropdown.Item>
            )}
            <Dropdown.Item
              key="summarize"
              height={DROPDOWN_ITEM_HEIGHT}
              onSelect={handleDialogOpen(ActionDialog.Summarize)}
            >
              {t('management.summarize')}
            </Dropdown.Item>
          </Dropdown.Group>
          {hasPermission(RoleScopeKind.manualReview) && (
            <>
              <Dropdown.Divider />
              <Dropdown.Group>
                <Dropdown.GroupTitle>{t('requests.title')}</Dropdown.GroupTitle>
                <Dropdown.Item
                  key="request-more-info"
                  height={DROPDOWN_ITEM_HEIGHT}
                  onSelect={handleDialogOpen(ActionDialog.RequestMoreInfo)}
                >
                  {t('requests.request-more-info')}
                </Dropdown.Item>
                <Dropdown.Item
                  key="auth-methods"
                  height={DROPDOWN_ITEM_HEIGHT}
                  onSelect={handleDialogOpen(ActionDialog.Auth)}
                >
                  {t('requests.allow-updating-login-methods')}
                </Dropdown.Item>
              </Dropdown.Group>
            </>
          )}
          {user?.isFirmEmployee && isOpenDatadogEnabled && (
            <>
              <Dropdown.Divider />
              <Dropdown.Group>
                <Dropdown.GroupTitle>{t('internal.title')}</Dropdown.GroupTitle>
                <Dropdown.Item key="datadog" height={DROPDOWN_ITEM_HEIGHT} onSelect={openDatadog}>
                  {t('internal.datadog')}
                </Dropdown.Item>
              </Dropdown.Group>
            </>
          )}
        </Dropdown.Content>
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
