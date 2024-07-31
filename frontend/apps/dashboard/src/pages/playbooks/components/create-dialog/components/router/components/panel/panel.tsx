import { LinkButton, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

export type PanelProps = {
  children: React.ReactNode;
  cta?: React.ReactNode;
  title: string;
};

const Panel = ({ children, cta, title }: PanelProps) => {
  return (
    <Container aria-label={title} role="region">
      <Header>
        <Text variant="label-3">{title}</Text>
        {cta}
      </Header>
      {children}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderColor.tertiary} ${theme.borderWidth[1]} solid;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[6]};
    padding: ${theme.spacing[5]} ${theme.spacing[6]};
    width: 100%;
  `};
`;

const Header = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

export default Panel;
