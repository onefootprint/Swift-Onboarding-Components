import React from 'react';
import styled, { css } from 'styled';

import { createFontStyles } from '../../../utils/mixins';

export type LabelProps = {
  children: string;
  htmlFor: string;
  id?: string;
};

const Label = ({ children, htmlFor, id }: LabelProps) => (
  <Container>
    <StyledLabel htmlFor={htmlFor} id={id}>
      {children}
    </StyledLabel>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[3]}px;
  `}
`;

const StyledLabel = styled.label`
  ${({ theme }) => css`
    ${createFontStyles('body-3')};
    color: ${theme.color.primary};
  `}
`;

export default Label;
