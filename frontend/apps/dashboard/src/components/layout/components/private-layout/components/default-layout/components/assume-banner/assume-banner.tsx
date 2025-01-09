import { getPrivateAccessRequestsOptions } from '@onefootprint/axios/dashboard';
import { IcoInfo16 } from '@onefootprint/icons';
import type { AccessRequest } from '@onefootprint/request-types/dashboard';
import { Banner, Dialog, Stack, Tooltip } from '@onefootprint/ui';
import { useQuery } from '@tanstack/react-query';
import { isAfter, parseISO } from 'date-fns';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSession from 'src/hooks/use-session';
import styled, { css } from 'styled-components';
import GrantEditRightsForm from './components/grant-edit-rights-form';

const AssumeBanner = () => {
  const { t } = useTranslation('common', { keyPrefix: 'components.private-layout.assume-banner' });
  const [showEditRightsForm, setShowEditRightsForm] = useState(false);
  const { data, isAssumedSessionEditMode, setAssumedSessionEditMode } = useSession();
  const { data: accessRequests } = useQuery(getPrivateAccessRequestsOptions());
  const router = useRouter();
  const canEnableEditMode =
    Array.isArray(accessRequests) &&
    accessRequests.some(
      (accessRequest: AccessRequest) =>
        accessRequest.requester === data.user?.email &&
        accessRequest.approved &&
        isAfter(parseISO(accessRequest.expiresAt), new Date()),
    );

  const handleChangeEdit = () => {
    if (isAssumedSessionEditMode) {
      setAssumedSessionEditMode(false);
    } else if (canEnableEditMode) {
      setAssumedSessionEditMode(true);
    } else {
      setShowEditRightsForm(true);
    }
  };

  const getEditButtonText = () => {
    if (isAssumedSessionEditMode) return t('disable-edit');
    if (canEnableEditMode) return t('enable-edit');
    return t('request-edit-mode');
  };

  const handleCloseEditRightsForm = () => {
    setShowEditRightsForm(false);
  };

  const handleLogout = () => {
    router.push({
      pathname: '/logout',
    });
  };

  return data.user?.isAssumedSession ? (
    <AssumeBannerContainer>
      <Banner
        variant={isAssumedSessionEditMode ? 'error' : 'info'}
        className="flex items-center justify-center gap-0.5"
      >
        <Stack direction="row" align="center" justify="center" gap={2}>
          <span>
            {t(isAssumedSessionEditMode ? 'edit-mode-title' : 'title', {
              orgName: data.org?.name,
            })}
          </span>
          {isAssumedSessionEditMode && (
            <Tooltip text={t('edit-mode-info', { orgName: data.org?.name })}>
              <IcoInfo16 color="error" />
            </Tooltip>
          )}
          <span>·</span>
          <button type="button" onClick={handleChangeEdit}>
            {getEditButtonText()}
          </button>
          <span>·</span>
          <button type="button" onClick={handleLogout}>
            {t('log-out')}
          </button>
        </Stack>
        <Dialog
          open={showEditRightsForm}
          onClose={handleCloseEditRightsForm}
          title="Request edit grant"
          description="Please fill out the form below to request edit mode."
        >
          <GrantEditRightsForm onClose={handleCloseEditRightsForm} />
        </Dialog>
      </Banner>
    </AssumeBannerContainer>
  ) : null;
};

const AssumeBannerContainer = styled.div`
  ${({ theme }) => css`
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    width: 100%;

    button {
      padding: 0;
      margin-left: ${theme.spacing[2]};

      &:disabled {
        cursor: default;
        opacity: 0.7;
      }
    }
  `};
`;

export default AssumeBanner;
