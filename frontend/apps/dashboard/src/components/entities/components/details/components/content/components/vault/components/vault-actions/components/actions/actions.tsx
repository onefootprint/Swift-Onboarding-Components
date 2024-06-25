import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import { EntityKind, RoleScopeKind } from '@onefootprint/types';
import { Dropdown } from '@onefootprint/ui';
import { useFlags } from 'launchdarkly-react-client-sdk';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate';
import useOrgSession from 'src/hooks/use-org-session';
import styled, { css } from 'styled-components';

import useSession from 'src/hooks/use-session';
import type { WithEntityProps } from '../../../../../../../with-entity';
import useEditControls from '../../hooks/use-edit-controls';
import { useOpenDatadog } from '../../hooks/use-open-datadog';
import AddToListDialog from '../add-to-list-dialog';
import RequestMoreInfoDialog from '../request-more-info-dialog';
import SummarizeAiDialog from '../summarize-ai-dialog';
import UpdateAuthDialog from '../update-auth-dialog';
import UploadDocDialog from '../upload-doc-dialog';
import ViewHistoricalDataDialog from '../view-historical-data-dialog';

enum ActionDialog {
  auth,
  requestMoreInfo,
  addToList,
  historicalData,
  summarize,
  uploadDoc,
}

const Actions = ({ entity }: WithEntityProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.entity.actions' });
  const { t: newT } = useTranslation('entity-details', {
    keyPrefix: 'header.actions',
  });
  const editControls = useEditControls();
  const [openDialog, setOpenDialog] = useState<ActionDialog | null>(null);
  const shouldShowActionsDropdown = entity.kind === EntityKind.person;
  const { AiPreviewFeaturesEnabledOrgIds } = useFlags();
  const orgIds = new Set<string>(AiPreviewFeaturesEnabledOrgIds);
  const {
    data: { user },
  } = useSession();
  const { openDatadog, isEnabled: isOpenDatadogEnabled } = useOpenDatadog();
  const { data } = useOrgSession();
  const showAiFeatures = data && orgIds.has(data.id);

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

  return shouldShowActionsDropdown ? (
    <>
      <Dropdown.Root>
        <StyledTrigger $asButton aria-label={t('cta')}>
          <IcoDotsHorizontal24 />
        </StyledTrigger>
        <Dropdown.Content align="end" sideOffset={8}>
          <PermissionGate scopeKind={RoleScopeKind.writeEntities} fallbackText={t('edit-user.not-allowed')}>
            <Dropdown.Item onSelect={editControls.start}>{t('edit-user.label')}</Dropdown.Item>
          </PermissionGate>
          <PermissionGate scopeKind={RoleScopeKind.writeEntities} fallbackText={newT('upload-doc.not-allowed')}>
            <Dropdown.Item onSelect={handleOpenUploadDocDialog}>{newT('upload-doc.label')}</Dropdown.Item>
          </PermissionGate>
          <PermissionGate scopeKind={RoleScopeKind.manualReview} fallbackText={t('request-more-info.not-allowed')}>
            <Dropdown.Item onSelect={handleOpenRequestMoreInfoDialog}>{t('request-more-info.label')}</Dropdown.Item>
          </PermissionGate>
          <PermissionGate scopeKind={RoleScopeKind.manualReview} fallbackText={t('update-auth-methods.not-allowed')}>
            <Dropdown.Item onSelect={handleOpenAuthMethodsDialog}>{t('update-auth-methods.label')}</Dropdown.Item>
          </PermissionGate>
          <PermissionGate scopeKind={RoleScopeKind.writeLists} fallbackText={t('add-to-list.not-allowed')}>
            <Dropdown.Item onSelect={handleOpenAddToListDialog}>{t('add-to-list.label')}</Dropdown.Item>
          </PermissionGate>
          <PermissionGate scopeKind={RoleScopeKind.manualReview} fallbackText={t('view-historical-data.not-allowed')}>
            <Dropdown.Item onSelect={handleOpenHistoricalDataDialog}>{t('view-historical-data.label')}</Dropdown.Item>
          </PermissionGate>
          {showAiFeatures && <Dropdown.Item onSelect={handleOpenSummarizeDialog}>{t('summarize.label')}</Dropdown.Item>}
          {user?.isFirmEmployee && (
            <Dropdown.Item disabled={!isOpenDatadogEnabled} onSelect={openDatadog}>
              {t('open-datadog')}
            </Dropdown.Item>
          )}
        </Dropdown.Content>
      </Dropdown.Root>
      <RequestMoreInfoDialog open={openDialog === ActionDialog.requestMoreInfo} onClose={handleCloseDialog} />
      <UpdateAuthDialog open={openDialog === ActionDialog.auth} onClose={handleCloseDialog} />
      <AddToListDialog open={openDialog === ActionDialog.addToList} onClose={handleCloseDialog} />
      <ViewHistoricalDataDialog open={openDialog === ActionDialog.historicalData} onClose={handleCloseDialog} />
      <SummarizeAiDialog open={openDialog === ActionDialog.summarize} onClose={handleCloseDialog} />
      <UploadDocDialog open={openDialog === ActionDialog.uploadDoc} onClose={handleCloseDialog} />
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
