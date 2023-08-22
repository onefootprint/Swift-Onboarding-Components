import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Box, LoadingIndicator, Typography } from '@onefootprint/ui';
import React from 'react';

import { HeaderTitle, NavigationHeader } from '../../../../../components';
import DESKTOP_INTERACTION_BOX_HEIGHT from '../../../constants/desktop-interaction-box.constants';
import { CameraPermissionState } from '../hooks/use-camera-permission';

type DesktopCameraPermissionProps = {
  permissionState: Exclude<CameraPermissionState, 'allowed'>;
};

const DesktopCameraPermission = ({
  permissionState,
}: DesktopCameraPermissionProps) => {
  const { t } = useTranslation(
    'pages.desktop-selfie.desktop-camera-permission',
  );

  return (
    <Container>
      <Box>
        <NavigationHeader />
        <HeaderTitle title={t('take-selfie')} />
      </Box>
      <CameraStateContainer height={DESKTOP_INTERACTION_BOX_HEIGHT}>
        {permissionState === 'undetected' ? (
          <LoadingIndicator />
        ) : (
          <Box sx={{ paddingLeft: 9, paddingRight: 9 }}>
            <Typography variant="label-2" sx={{ textAlign: 'center' }}>
              {t('title')}
            </Typography>
            <Typography
              variant="body-2"
              color="tertiary"
              sx={{ textAlign: 'center' }}
            >
              {t('subtitle')}
            </Typography>
          </Box>
        )}
      </CameraStateContainer>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
  `}
`;

const CameraStateContainer = styled.div<{
  height: number;
}>`
  ${({ theme, height }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: ${height}px;
    background-color: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.default};
  `}
`;

export default DesktopCameraPermission;
