import { IcoDotsHorizontal24, IcoPencil16 } from '@onefootprint/icons';
import { EntityKind, RoleScopeKind } from '@onefootprint/types';
import { Dropdown, IconButton } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import useTags from '@/entity/hooks/use-tags';
import PermissionGate from 'src/components/permission-gate';
import usePermissions from 'src/hooks/use-permissions';
import useSession from 'src/hooks/use-session';
import type { WithEntityProps } from '../../../../../../../with-entity';
import useEditControls from '../../hooks/use-edit-controls';
import { useOpenDatadog } from '../../hooks/use-open-datadog';
import AddToListDialog from '../add-to-list-dialog';
import EditTagsDialog from '../edit-tags-dialog';
import RequestMoreInfoDialog from '../request-more-info-dialog';
import SummarizeAiDialog from '../summarize-ai-dialog';
import UpdateAuthDialog from '../update-auth-dialog';
import UploadDocDialog from '../upload-doc-dialog';
import ViewHistoricalDataDialog from '../view-historical-data-dialog';

enum ActionDialog {
  auth = 0,
  requestMoreInfo = 1,
  addToList = 2,
  historicalData = 3,
  summarize = 4,
  uploadDoc = 5,
  editTags = 6,
}

const DROPDOWN_ITEM_HEIGHT = '32px';

const Actions = ({ entity }: WithEntityProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.entity.actions' });
  const { t: newT } = useTranslation('entity-details', {
    keyPrefix: 'header.actions',
  });
  const editControls = useEditControls();
  const { data: tags } = useTags(entity.id);
  const [openDialog, setOpenDialog] = useState<ActionDialog | null>(null);
  const {
    data: { user },
  } = useSession();
  const { hasPermission } = usePermissions();
  const hasLabelAndTagPermissions = hasPermission(RoleScopeKind.labelAndTag);
  const { openDatadog, isEnabled: isOpenDatadogEnabled } = useOpenDatadog();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleCloseDialog = () => {
    setOpenDialog(null);
  };

  const handleOpenRequestMoreInfoDialog = () => {
    setDropdownOpen(false);
    setOpenDialog(ActionDialog.requestMoreInfo);
  };

  const handleOpenAuthMethodsDialog = () => {
    setDropdownOpen(false);
    setOpenDialog(ActionDialog.auth);
  };

  const handleOpenAddToListDialog = () => {
    setDropdownOpen(false);
    setOpenDialog(ActionDialog.addToList);
  };

  const handleOpenSummarizeDialog = () => {
    setDropdownOpen(false);
    setOpenDialog(ActionDialog.summarize);
  };

  const handleOpenUploadDocDialog = () => {
    setDropdownOpen(false);
    setOpenDialog(ActionDialog.uploadDoc);
  };

  const handleOpenHistoricalDataDialog = () => {
    setDropdownOpen(false);
    setOpenDialog(ActionDialog.historicalData);
  };

  const handleOpenEditTagsDialog = () => {
    setDropdownOpen(false);
    setOpenDialog(ActionDialog.editTags);
  };

  return entity.kind === EntityKind.person ? (
    <>
      <Dropdown.Root onOpenChange={setDropdownOpen} open={dropdownOpen}>
        <Dropdown.Trigger>
          <IconButton variant="secondary" aria-label={t('cta')} size="compact">
            <IcoDotsHorizontal24 />
          </IconButton>
        </Dropdown.Trigger>
        <Dropdown.Portal>
          <Dropdown.Content align="end" sideOffset={8} minWidth="200px">
            <Dropdown.Group>
              <Dropdown.GroupTitle>{t('groups.user-management')}</Dropdown.GroupTitle>
              {hasPermission(RoleScopeKind.writeEntities) && (
                <Dropdown.Item height={DROPDOWN_ITEM_HEIGHT} onSelect={editControls.start}>
                  {t('edit-user.label')}
                </Dropdown.Item>
              )}
              {hasLabelAndTagPermissions && (
                <Dropdown.Item height="32px" onSelect={handleOpenEditTagsDialog}>
                  {tags?.length ? t('edit-tags.edit-label') : t('edit-tags.add-label')}
                </Dropdown.Item>
              )}
              {hasPermission(RoleScopeKind.writeEntities) && (
                <Dropdown.Item height={DROPDOWN_ITEM_HEIGHT} onSelect={handleOpenUploadDocDialog}>
                  {newT('upload-doc.label')}
                </Dropdown.Item>
              )}
              {hasPermission(RoleScopeKind.manualReview) && (
                <Dropdown.Item height={DROPDOWN_ITEM_HEIGHT} onSelect={handleOpenHistoricalDataDialog}>
                  {t('view-historical-data.label')}
                </Dropdown.Item>
              )}
              {hasPermission(RoleScopeKind.writeLists) && (
                <Dropdown.Item height={DROPDOWN_ITEM_HEIGHT} onSelect={handleOpenAddToListDialog}>
                  {t('add-to-list.label')}
                </Dropdown.Item>
              )}
              <Dropdown.Item height={DROPDOWN_ITEM_HEIGHT} onSelect={handleOpenSummarizeDialog}>
                {t('summarize.label')}
              </Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Separator />
            {hasPermission(RoleScopeKind.manualReview) && (
              <Dropdown.Group>
                <Dropdown.GroupTitle>{t('groups.user-requests')}</Dropdown.GroupTitle>
                <Dropdown.Item height={DROPDOWN_ITEM_HEIGHT} onSelect={handleOpenRequestMoreInfoDialog}>
                  {t('request-more-info.label')}
                </Dropdown.Item>
                <Dropdown.Item height={DROPDOWN_ITEM_HEIGHT} onSelect={handleOpenAuthMethodsDialog}>
                  {t('update-auth-methods.label')}
                </Dropdown.Item>
              </Dropdown.Group>
            )}
            <Dropdown.Separator />
            {user?.isFirmEmployee && isOpenDatadogEnabled && (
              <Dropdown.Group>
                <Dropdown.GroupTitle>{t('groups.internal')}</Dropdown.GroupTitle>
                <Dropdown.Item height={DROPDOWN_ITEM_HEIGHT} onSelect={openDatadog}>
                  {t('open-datadog')}
                </Dropdown.Item>
              </Dropdown.Group>
            )}
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>
      <RequestMoreInfoDialog open={openDialog === ActionDialog.requestMoreInfo} onClose={handleCloseDialog} />
      <UpdateAuthDialog open={openDialog === ActionDialog.auth} onClose={handleCloseDialog} />
      <AddToListDialog open={openDialog === ActionDialog.addToList} onClose={handleCloseDialog} />
      <ViewHistoricalDataDialog open={openDialog === ActionDialog.historicalData} onClose={handleCloseDialog} />
      <SummarizeAiDialog open={openDialog === ActionDialog.summarize} onClose={handleCloseDialog} />
      <UploadDocDialog open={openDialog === ActionDialog.uploadDoc} onClose={handleCloseDialog} />
      {hasLabelAndTagPermissions && (
        <EditTagsDialog open={openDialog === ActionDialog.editTags} onClose={handleCloseDialog} />
      )}
    </>
  ) : (
    <PermissionGate scopeKind={RoleScopeKind.writeEntities} fallbackText={t('edit-business.not-allowed')}>
      <IconButton variant="secondary" aria-label={t('edit-business.label')} size="compact" onClick={editControls.start}>
        <IcoPencil16 />
      </IconButton>
    </PermissionGate>
  );
};

export default Actions;
