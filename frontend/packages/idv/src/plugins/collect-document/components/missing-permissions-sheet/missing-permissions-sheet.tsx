import { BottomSheet, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import HeaderTitle from '../../../../components/layout/components/header-title';
import type { DeviceInfo } from '../../../../hooks';

export type MissingPermissionsSheetProps = {
  device: DeviceInfo;
  open: boolean;
  onClose?: () => void;
};

const MissingPermissionsSheet = ({ device, open, onClose }: MissingPermissionsSheetProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.components.missing-permissions',
  });
  const { osName, type: deviceType, browser } = device;

  const getTranslation = () => {
    if (browser.includes('Safari')) {
      return t('cta-safari');
    }
    if (deviceType === 'mobile') {
      if (osName === 'iOS') {
        return t('cta-ios');
      }
      if (osName === 'Android') {
        return t('cta-android');
      }
      return t('cta-mobile');
    }
    return t('cta-desktop');
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <Container>
        <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
        <Text variant="body-2" textAlign="center" marginTop={9}>
          {getTranslation()}
        </Text>
      </Container>
    </BottomSheet>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[5]};
    margin-bottom: ${theme.spacing[9]};
  `}
`;

export default MissingPermissionsSheet;
