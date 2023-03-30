import { Grid, LinkButton, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

export type FieldsetProps = {
  children: React.ReactNode;
  title?: string;
  cta?: {
    label: string;
    onClick: () => void;
  };
};

/*
  TODO: Check in with design about consolidating everything in this styling
*/

const Fieldset = ({ children, cta, title }: FieldsetProps) => (
  <FieldsetContainer>
    <Header hasTitle={!!title}>
      {title && (
        <Typography variant="label-2" as="div">
          {title}
        </Typography>
      )}
      {cta && (
        <LinkButton
          size="compact"
          onClick={cta.onClick}
          sx={{ position: 'absolute', top: 0, right: 0 }}
        >
          {cta.label}
        </LinkButton>
      )}
    </Header>
    <Content>{children}</Content>
  </FieldsetContainer>
);

const Header = styled.header<{ hasTitle: boolean }>`
  ${({ theme, hasTitle }) => css`
    margin-bottom: ${theme.spacing[6]};
    display: flex;
    align-items: center;
    justify-content: space-between;

    ${!hasTitle &&
    css`
      position: relative;
      margin-bottom: 0;
    `}
  `};
`;

const FieldsetContainer = styled.fieldset`
  position: relative;
`;

const Content = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};

    ${Grid.Column} {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing[5]};
    }
  `};
`;

export default Fieldset;
