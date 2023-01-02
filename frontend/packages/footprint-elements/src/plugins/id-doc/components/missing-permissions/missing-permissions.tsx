import { useTranslation } from '@onefootprint/hooks';
import { BottomSheet, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import { HeaderTitle } from '../../../../components';

type MissingPermissionsProps = {
  permissionName: string;
  open: boolean;
  onClose: () => void;
};

const MissingPermissions = ({
  permissionName,
  open,
  onClose,
}: MissingPermissionsProps) => {
  const { t } = useTranslation('components.missing-permissions');
  return (
    <BottomSheet open={open} onClose={onClose} title="">
      <Body>
        <TextContainer>
          <HeaderTitle
            title={t('title', { permissionName })}
            subtitle={t('subtitle')}
          />
          {/* 
            TODO: Check if settings can be opened here.
            https://linear.app/footprint/issue/FP-1422/check-whether-settings-on-phone-can-be-opened-automatically-if-camera
           */}
          <Typography
            variant="body-2"
            sx={{ textAlign: 'center', marginTop: 9 }}
          >
            {t('action-required')}
          </Typography>
        </TextContainer>
      </Body>
    </BottomSheet>
  );
};

const Body = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[7]} 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  `}
`;

const TextContainer = styled.div`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[8]};
    margin-bottom: ${theme.spacing[9]};
  `}
`;

export default MissingPermissions;
