import { useTranslation } from '@onefootprint/hooks';
import { IcoInfo16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { RoleScopeKind } from '@onefootprint/types';
import { Banner, Stack, Tooltip } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';
import useSession from 'src/hooks/use-session';

const AssumeBanner = () => {
  const { t } = useTranslation('components.private-layout.assume-banner');
  const { data, isAssumedSessionEditMode, setAssumedSessionEditMode } =
    useSession();
  const router = useRouter();
  const canUserAccessEditMode = data.user?.scopes.some(
    s => s.kind !== RoleScopeKind.read,
  );

  const handleChangeEdit = () => {
    setAssumedSessionEditMode(!isAssumedSessionEditMode);
  };

  const handleLogout = () => {
    router.push({
      pathname: '/organizations',
      query: { token: data.auth },
    });
  };

  return data.user?.isAssumedSession ? (
    <AssumeBannerContainer>
      <StyledBanner variant={isAssumedSessionEditMode ? 'error' : 'info'}>
        <Stack direction="row" gap={2}>
          {t(isAssumedSessionEditMode ? 'edit-mode-title' : 'title', {
            orgName: data.org?.name,
          })}
          {isAssumedSessionEditMode && (
            <Tooltip text={t('edit-mode-info', { orgName: data.org?.name })}>
              <IcoInfo16 />
            </Tooltip>
          )}
          {canUserAccessEditMode && (
            <>
              <button type="button" onClick={handleChangeEdit}>
                {isAssumedSessionEditMode
                  ? t('disable-edit')
                  : t('enable-edit')}
              </button>
              ·
            </>
          )}
          <button type="button" onClick={handleLogout}>
            {t('log-out')}
          </button>
        </Stack>
      </StyledBanner>
    </AssumeBannerContainer>
  ) : null;
};

const StyledBanner = styled(Banner)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[1]};
  `};
`;

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
