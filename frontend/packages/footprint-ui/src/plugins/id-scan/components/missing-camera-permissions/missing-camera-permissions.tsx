import { useTranslation } from 'hooks';
import { IlluLightPhoneWithId } from 'icons';
import React from 'react';
import styled, { css } from 'styled-components';
import { BottomSheet, Typography } from 'ui';

import { HeaderTitle } from '../../../../components';

type MissingCameraPermissionsProps = {
  open: boolean;
  onClose: () => void;
};

const MissingCameraPermissions = ({
  open,
  onClose,
}: MissingCameraPermissionsProps) => {
  const { t } = useTranslation('components.missing-camera-permissions');
  return (
    <BottomSheet open={open} onClose={onClose} title="">
      <Body>
        <IlluLightPhoneWithId />
        <TextContainer>
          <HeaderTitle title="title" subtitle="description" />
          {/* 
            TODO: Check if settings can be opened here.
            https://linear.app/footprint/issue/FP-1422/check-whether-settings-on-phone-can-be-opened-automatically-if-camera
           */}
          <Typography variant="body-2">{t('action-required')}</Typography>
        </TextContainer>
      </Body>
    </BottomSheet>
  );
};

const Body = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[7]}px 0;
    display: flex;
    justify-content: center;
    align-items: center;
  `}
`;

const TextContainer = styled.div`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[8]}px;
    margin-bottom: ${theme.spacing[9]}px;
  `}
`;

export default MissingCameraPermissions;
