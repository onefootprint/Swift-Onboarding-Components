import type { WithEntityProps } from '@/entity/components/with-entity';
import useTags from '@/entity/hooks/use-entity-tags';
import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import { type DataIdentifier, IdDI } from '@onefootprint/types';
import { Box, Dropdown, IconButton } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import usePermissions from 'src/hooks/use-permissions';
import useSession from 'src/hooks/use-session';
import styled from 'styled-components';
import DecryptMachineProvider from '../../../../../decrypt-machine';
import { useOpenDatadog } from '../../hooks/use-open-datadog';
import EditTagsDialog from '../edit-tags-dialog';
import EditVaultDrawer from '../edit-vault-drawer';
import UploadDocDialog from '../upload-doc-dialog';
import RequestMoreInfoDialog from './components/request-more-info-dialog';
import SummarizeAiDialog from './components/summarize-ai-dialog';
import UpdateAuthDialog from './components/update-auth-dialog';

enum ActionDialog {
  Auth = 'auth',
  RequestMoreInfo = 'request-more-info',
  Summarize = 'summarize',
  UploadDoc = 'upload-doc',
  EditTags = 'edit-tags',
  EditVault = 'edit-vault',
}

const UserActions = ({ entity }: WithEntityProps) => {
  const { t } = useTranslation('user-details', { keyPrefix: 'header.actions' });
  const { data: tags } = useTags(entity.id);
  const [openDialog, setOpenDialog] = useState<ActionDialog | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const {
    data: { user },
  } = useSession();
  const { hasPermission } = usePermissions();
  const hasLabelAndTagPermissions = hasPermission('label_and_tag');
  const { openDatadog, isEnabled: isOpenDatadogEnabled } = useOpenDatadog();

  const hasContactInfo = entity.data.some(d => [IdDI.phoneNumber as DataIdentifier, IdDI.email].includes(d.identifier));

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
            {hasPermission('write_entities') && (
              <DropdownItem onSelect={handleDialogOpen(ActionDialog.EditVault)}>{t('management.edit')}</DropdownItem>
            )}
            {hasLabelAndTagPermissions && (
              <DropdownItem onSelect={handleDialogOpen(ActionDialog.EditTags)}>
                {tags?.length ? t('management.edit-tags') : t('management.add-tags')}
              </DropdownItem>
            )}
            {hasPermission('write_entities') && (
              <DropdownItem onSelect={handleDialogOpen(ActionDialog.UploadDoc)}>
                {t('management.upload-document')}
              </DropdownItem>
            )}
            <DropdownItem onSelect={handleDialogOpen(ActionDialog.Summarize)}>{t('management.summarize')}</DropdownItem>
          </Dropdown.Group>
          {hasPermission('manual_review') && (
            <>
              <Dropdown.Divider />
              <Dropdown.Group>
                <Dropdown.GroupTitle>{t('requests.title')}</Dropdown.GroupTitle>
                {hasContactInfo && (
                  <DropdownItem onSelect={handleDialogOpen(ActionDialog.RequestMoreInfo)}>
                    {t('requests.request-more-info')}
                  </DropdownItem>
                )}
                <DropdownItem onSelect={handleDialogOpen(ActionDialog.Auth)}>
                  {t('requests.allow-updating-login-methods')}
                </DropdownItem>
              </Dropdown.Group>
            </>
          )}
          {user?.isFirmEmployee && isOpenDatadogEnabled && (
            <>
              <Dropdown.Divider />
              <Dropdown.Group>
                <Dropdown.GroupTitle>{t('internal.title')}</Dropdown.GroupTitle>
                <DropdownItem onSelect={openDatadog}>{t('internal.datadog')}</DropdownItem>
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
      <SummarizeAiDialog open={openDialog === ActionDialog.Summarize} onClose={handleCloseDialog} />
      <UploadDocDialog open={openDialog === ActionDialog.UploadDoc} onClose={handleCloseDialog} />
      {hasLabelAndTagPermissions && (
        <EditTagsDialog open={openDialog === ActionDialog.EditTags} onClose={handleCloseDialog} />
      )}
    </>
  );
};

const DropdownItem = styled(Dropdown.Item)`
  height: 32px;
`;

export default UserActions;
