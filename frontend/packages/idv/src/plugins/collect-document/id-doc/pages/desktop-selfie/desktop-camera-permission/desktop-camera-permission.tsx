import { Box, LoadingSpinner, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { HeaderTitle, NavigationHeader } from '../../../../../../components';
import { DESKTOP_INTERACTION_BOX_HEIGHT } from '../../../../constants';
import type { CameraPermissionState } from '../hooks/use-camera-permission';

type DesktopCameraPermissionProps = {
  permissionState: Exclude<CameraPermissionState, 'allowed'>;
};

const DesktopCameraPermission = ({ permissionState }: DesktopCameraPermissionProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.id-doc.pages.desktop-selfie.desktop-camera-permission',
  });

  return (
    <Container>
      <Box>
        <NavigationHeader leftButton={{ variant: 'close', confirmClose: true }} />
        <HeaderTitle title={t('take-selfie')} />
      </Box>
      <CameraStateContainer $height={DESKTOP_INTERACTION_BOX_HEIGHT}>
        {permissionState === 'undetected' ? (
          <LoadingSpinner />
        ) : (
          <Box paddingLeft={9} paddingRight={9}>
            <Text variant="label-2" textAlign="center">
              {t(`title.${permissionState}`)}
            </Text>
            <Text variant="body-2" color="tertiary" textAlign="center">
              {t(`subtitle.${permissionState}`)}
            </Text>
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

const CameraStateContainer = styled.div<{ $height: number }>`
  ${({ theme, $height }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: ${$height}px;
    background-color: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.default};
  `}
`;

export default DesktopCameraPermission;
