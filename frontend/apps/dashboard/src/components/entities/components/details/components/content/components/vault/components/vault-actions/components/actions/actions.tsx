import { IcoDotsHorizontal24, IcoPencil16 } from '@onefootprint/icons';
import { EntityKind, RoleScopeKind } from '@onefootprint/types';
import { Button, Dropdown, Stack } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate';

import useTags from '@/entity/hooks/use-tags';
import usePermissions from 'src/hooks/use-permissions';
import useSession from 'src/hooks/use-session';
import styled, { css } from 'styled-components';
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

const Actions = ({ entity }: WithEntityProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.entity.actions' });
  const { t: newT } = useTranslation('entity-details', { keyPrefix: 'header.actions' });
  const editControls = useEditControls();
  const { data: tags } = useTags(entity.id);
  const [openDialog, setOpenDialog] = useState<ActionDialog | null>(null);
  const {
    data: { user },
  } = useSession();
  const { hasPermission } = usePermissions();
  const hasLabelAndTagPermissions = hasPermission(RoleScopeKind.labelAndTag);
  const { openDatadog, isEnabled: isOpenDatadogEnabled } = useOpenDatadog();

  const handleCloseDialog = () => {
    setOpenDialog(null);
  };

  const handleOpenRequestMoreInfoDialog = () => {
    setOpenDialog(ActionDialog.requestMoreInfo);
  };

  const handleOpenAuthMethodsDialog = () => {
    setOpenDialog(ActionDialog.auth);
  };

  const handleOpenAddToListDialog = () => {
    setOpenDialog(ActionDialog.addToList);
  };

  const handleOpenSummarizeDialog = () => {
    setOpenDialog(ActionDialog.summarize);
  };

  const handleOpenUploadDocDialog = () => {
    setOpenDialog(ActionDialog.uploadDoc);
  };

  const handleOpenHistoricalDataDialog = () => {
    setOpenDialog(ActionDialog.historicalData);
  };

  const handleOpenEditTagsDialog = () => {
    setOpenDialog(ActionDialog.editTags);
  };

  return entity.kind === EntityKind.person ? (
    <>
      <Dropdown.Root>
        <Dropdown.Trigger aria-label={t('cta')} asChild>
          <DotsButton>
            <IcoDotsHorizontal24 />
          </DotsButton>
        </Dropdown.Trigger>
        <Dropdown.Content align="end" sideOffset={8}>
          <Dropdown.Group>
            <Dropdown.GroupTitle>{t('groups.user-management')}</Dropdown.GroupTitle>
            <PermissionGate scopeKind={RoleScopeKind.writeEntities} fallbackText={t('edit-user.not-allowed')}>
              <Dropdown.Item onSelect={editControls.start}>{t('edit-user.label')}</Dropdown.Item>
            </PermissionGate>
            <PermissionGate scopeKind={RoleScopeKind.labelAndTag} fallbackText={t('edit-tags.not-allowed')}>
              <Dropdown.Item onSelect={handleOpenEditTagsDialog}>
                {tags?.length ? t('edit-tags.edit-label') : t('edit-tags.add-label')}
              </Dropdown.Item>
            </PermissionGate>
            <PermissionGate scopeKind={RoleScopeKind.writeEntities} fallbackText={newT('upload-doc.not-allowed')}>
              <Dropdown.Item onSelect={handleOpenUploadDocDialog}>{newT('upload-doc.label')}</Dropdown.Item>
            </PermissionGate>
            <PermissionGate scopeKind={RoleScopeKind.manualReview} fallbackText={t('view-historical-data.not-allowed')}>
              <Dropdown.Item onSelect={handleOpenHistoricalDataDialog}>{t('view-historical-data.label')}</Dropdown.Item>
            </PermissionGate>
            <PermissionGate scopeKind={RoleScopeKind.writeLists} fallbackText={t('add-to-list.not-allowed')}>
              <Dropdown.Item onSelect={handleOpenAddToListDialog}>{t('add-to-list.label')}</Dropdown.Item>
            </PermissionGate>
            <Dropdown.Item onSelect={handleOpenSummarizeDialog}>{t('summarize.label')}</Dropdown.Item>
          </Dropdown.Group>
          <Dropdown.Separator />
          <Dropdown.Group>
            <Dropdown.GroupTitle>{t('groups.user-requests')}</Dropdown.GroupTitle>
            <PermissionGate scopeKind={RoleScopeKind.manualReview} fallbackText={t('request-more-info.not-allowed')}>
              <Dropdown.Item onSelect={handleOpenRequestMoreInfoDialog}>{t('request-more-info.label')}</Dropdown.Item>
            </PermissionGate>
            <PermissionGate scopeKind={RoleScopeKind.manualReview} fallbackText={t('update-auth-methods.not-allowed')}>
              <Dropdown.Item onSelect={handleOpenAuthMethodsDialog}>{t('update-auth-methods.label')}</Dropdown.Item>
            </PermissionGate>
          </Dropdown.Group>
          <Dropdown.Separator />
          {user?.isFirmEmployee && (
            <Dropdown.Group>
              <Dropdown.GroupTitle>{t('groups.internal')}</Dropdown.GroupTitle>
              <Dropdown.Item disabled={!isOpenDatadogEnabled} onSelect={openDatadog}>
                {t('open-datadog')}
              </Dropdown.Item>
            </Dropdown.Group>
          )}
        </Dropdown.Content>
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
      <EditContainer>
        <Button variant="secondary" onClick={editControls.start}>
          <Stack align="center" justify="center">
            <IcoPencil16 />
          </Stack>
        </Button>
      </EditContainer>
    </PermissionGate>
  );
};

const DotsButton = styled.button`
  ${({ theme }) => {
    const { button } = theme.components;
    return css`
      all: unset;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: ${button.borderRadius};
      background-color: ${button.variant.secondary.bg};
      color: ${button.variant.secondary.color};
      border: ${button.borderWidth} solid ${button.variant.secondary.borderColor};

      &:not([data-disabled]) {
        &:hover {
          background-color: ${button.variant.secondary.hover.bg};
          color: ${button.variant.secondary.hover.color};
          border-color: ${button.variant.secondary.hover.borderColor};
        }

        &:active {
          background-color: ${button.variant.secondary.active.bg};
          color: ${button.variant.secondary.active.color};
          border-color: ${button.variant.secondary.active.borderColor};
        }
      }

      &[data-disabled] {
        cursor: initial;
        opacity: 0.5;
      }
    `;
  }}
`;

const EditContainer = styled.div`
  ${({ theme }) => css`
    > button {
      padding: 0 ${theme.spacing[3]} !important;
    }
  `}
`;

export default Actions;
