import { IcoClose24 } from '@onefootprint/icons';
import React from 'react';
import styled, { css } from 'styled-components';

import Box from '../../box';
import Stack from '../../stack';
import Text from '../../text';
import type { DialogHeaderIcon } from '../dialog.types';
import HeaderIcon from './heder-icon';

type DialogHeaderProps = {
  title: string;
  onClose?: () => void;
  headerIcon?: DialogHeaderIcon;
};

const HEADER_ICON_SIZE = '24px';
const HEADER_HEIGHT = '44px';

const DialogHeader = ({ title, onClose, headerIcon }: DialogHeaderProps) => (
  <Container>
    <HeaderIcon
      component={headerIcon?.component || IcoClose24}
      onClick={onClose}
      ariaLabel={headerIcon?.ariaLabel}
    />
    {title && (
      <>
        <Text variant="label-3">{title}</Text>
        <Box width={HEADER_ICON_SIZE} height={HEADER_ICON_SIZE} />
      </>
    )}
  </Container>
);

const Container = styled(Stack)`
  ${({ theme }) => css`
    align-items: center;
    justify-content: space-between;
    padding: ${theme.spacing[3]};
    height: ${HEADER_HEIGHT};
  `}
`;

export default DialogHeader;
