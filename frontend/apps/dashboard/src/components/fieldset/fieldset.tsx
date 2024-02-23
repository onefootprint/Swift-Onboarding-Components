import { LinkButton, Text } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

export type FieldsetProps = {
  children: React.ReactNode;
  cta?: {
    label: string;
    onClick: () => void;
  };
  title: string;
};

const Fieldset = ({ children, cta, title }: FieldsetProps) => (
  <FieldsetContainer aria-label={title}>
    <Header>
      <Text variant="label-2" as="div">
        {title}
      </Text>
      {cta && (
        <LinkButton size="compact" onClick={cta.onClick}>
          {cta.label}
        </LinkButton>
      )}
    </Header>
    <Content>{children}</Content>
  </FieldsetContainer>
);

const FieldsetContainer = styled.fieldset`
  ${({ theme }) => css`
    &:not(:last-child) {
      border-bottom: 1px solid ${theme.borderColor.tertiary};
      margin-bottom: ${theme.spacing[7]};
      padding-bottom: ${theme.spacing[7]};
    }
  `};
`;

const Header = styled.header`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[6]};
    display: flex;
    align-items: center;
    justify-content: space-between;
  `};
`;

const Content = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `};
`;

export default Fieldset;
