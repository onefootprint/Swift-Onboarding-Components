import { media } from '@onefootprint/ui';
import type React from 'react';
import styled, { css } from 'styled-components';

import Portal from '../portal';
import { BOTTOM_ACTION_BOX_PORTAL_SELECTOR } from './constants';

type StickyBottomBoxProps = {
  children: React.ReactNode;
};

const StickyBottomBox = ({ children }: StickyBottomBoxProps) => (
  <Portal selector={BOTTOM_ACTION_BOX_PORTAL_SELECTOR}>
    <Container>{children}</Container>
  </Portal>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    padding: ${theme.spacing[5]};
    background-color: ${theme.backgroundColor.primary};

    ${media.greaterThan('md')`
      padding: ${theme.spacing[5]} ${theme.spacing[7]}; 
    `}
  `}
`;

export default StickyBottomBox;
