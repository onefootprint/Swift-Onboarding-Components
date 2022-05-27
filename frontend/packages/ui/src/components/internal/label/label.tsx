import React from 'react';
import styled, { css } from 'styled';

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
    color: ${theme.color.primary};
    font-family: ${theme.typography['body-3'].fontFamily};
    font-size: ${theme.typography['body-3'].fontSize};
    font-weight: ${theme.typography['body-3'].fontWeight};
    line-height: ${theme.typography['body-3'].lineHeight};
  `}
`;

export default Label;
