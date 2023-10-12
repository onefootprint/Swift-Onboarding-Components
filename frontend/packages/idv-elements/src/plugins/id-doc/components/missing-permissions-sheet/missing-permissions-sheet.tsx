import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { BottomSheet, Typography } from '@onefootprint/ui';
import React from 'react';

import HeaderTitle from '../../../../components/layout/components/header-title';

export type MissingPermissionsSheetProps = {
  open: boolean;
  onClose?: () => void;
};

const MissingPermissionsSheet = ({
  open,
  onClose,
}: MissingPermissionsSheetProps) => {
  const { t } = useTranslation('components.missing-permissions');

  return (
    <BottomSheet open={open} onClose={onClose}>
      <Container>
        <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
        <Typography variant="body-2" sx={{ textAlign: 'center', marginTop: 9 }}>
          {t('cta')}
        </Typography>
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
