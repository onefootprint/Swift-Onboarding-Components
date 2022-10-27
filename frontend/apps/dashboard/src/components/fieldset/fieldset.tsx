import { Grid, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type FieldsetProps = {
  children: React.ReactNode;
  title: string;
};

const Fieldset = ({ title, children }: FieldsetProps) => (
  <FieldsetContainer>
    <Typography variant="label-2" sx={{ marginBottom: 6 }}>
      {title}
    </Typography>
    <Content>{children}</Content>
  </FieldsetContainer>
);

const FieldsetContainer = styled.fieldset`
  ${({ theme }) => css`
    &:not(:last-child) {
      border-bottom: 1px solid ${theme.borderColor.tertiary};
      margin-bottom: ${theme.spacing[7]}px;
      padding-bottom: ${theme.spacing[7]}px;
    }
  `};
`;

const Content = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[3]}px;

    ${Grid.Column} {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing[3]}px;
    }
  `};
`;

export default Fieldset;
