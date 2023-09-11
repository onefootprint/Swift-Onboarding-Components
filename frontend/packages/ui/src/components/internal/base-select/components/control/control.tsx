import { IcoSearch16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import React from 'react';
import type { ControlProps } from 'react-select';
import { components } from 'react-select';

const Control = ({ children, ...props }: ControlProps) => (
  <Container>
    <IcoSearch16 color="quaternary" />
    <components.Control {...props}>{children}</components.Control>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    align-items: center;
    border-bottom: ${theme.borderWidth[1]} solid
      ${theme.components.dropdown.borderColor};
    display: flex;
    padding-left: ${theme.spacing[5]};
    width: 100%;
  `}
`;

export default Control;
