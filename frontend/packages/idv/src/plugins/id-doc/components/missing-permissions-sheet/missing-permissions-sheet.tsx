import { BottomSheet, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import HeaderTitle from '../../../../components/layout/components/header-title';
import { useIdDocMachine } from '../machine-provider';

export type MissingPermissionsSheetProps = {
  open: boolean;
  onClose?: () => void;
};

const MissingPermissionsSheet = ({
  open,
  onClose,
}: MissingPermissionsSheetProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'id-doc.components.missing-permissions',
  });
  const [state] = useIdDocMachine();
  const {
    context: {
      device: { osName, type: deviceType, browser },
    },
  } = state;

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
