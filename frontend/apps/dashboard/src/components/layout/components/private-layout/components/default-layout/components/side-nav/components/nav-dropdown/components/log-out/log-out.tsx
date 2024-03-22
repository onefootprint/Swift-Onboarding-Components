import { IcoLogOut24 } from '@onefootprint/icons';
import { Dropdown } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import { OPTION_HEIGHT } from '../../nav-dropdown.constants';
import SectionContainer from '../section-container';

type LogOutProps = {
  onSelect: () => void;
  children: React.ReactNode;
};

const LogOut = ({ onSelect, children }: LogOutProps) => (
  <SectionContainer top={3} bottom={2}>
    <Container onSelect={onSelect}>
      <IcoLogOut24 />
      {children}
    </Container>
  </SectionContainer>
);

const Container = styled(Dropdown.Item)`
  ${({ theme }) => css`
    position: relative;
    align-items: center;
    display: flex;
    height: ${OPTION_HEIGHT};
    gap: ${theme.spacing[3]};
  `}
`;

export default LogOut;
