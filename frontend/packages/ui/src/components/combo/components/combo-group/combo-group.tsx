import { Command } from 'cmdk';
import type React from 'react';
import styled, { css } from 'styled-components';

type ComboGroupProps = {
  children: React.ReactNode;
};

const ComboGroup: React.FC<ComboGroupProps> = ({ children }) => {
  return <StyledCommandGroup>{children}</StyledCommandGroup>;
};

const StyledCommandGroup = styled(Command.Group)`
  ${({ theme }) => css`
    padding: ${theme.spacing[2]};
  `}
`;

export default ComboGroup;
