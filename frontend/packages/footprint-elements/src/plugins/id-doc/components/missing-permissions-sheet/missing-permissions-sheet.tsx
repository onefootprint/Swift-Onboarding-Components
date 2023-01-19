import { useTranslation } from '@onefootprint/hooks';
import { BottomSheet, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import { HeaderTitle } from '../../../../components';

export type MissingPermissionsSheetProps = {
  permissionName: string;
  open: boolean;
  onClose?: () => void;
};

const MissingPermissionsSheet = ({
  permissionName,
  open,
  onClose,
}: MissingPermissionsSheetProps) => {
  const { t } = useTranslation('components.missing-permissions');

  return (
    <BottomSheet open={open} onClose={onClose} title="">
      <Container>
        <HeaderTitle
          title={t('title', { permissionName })}
          subtitle={t('subtitle')}
        />
        <Typography variant="body-2" sx={{ textAlign: 'center', marginTop: 9 }}>
          {t('open-settings')}
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
