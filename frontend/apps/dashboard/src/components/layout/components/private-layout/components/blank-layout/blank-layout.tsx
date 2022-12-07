import { useTranslation } from '@onefootprint/hooks';
import { IcoArrowRightSmall16, LogoFpCompact } from '@onefootprint/icons';
import { Container, LinkButton } from '@onefootprint/ui';
import React from 'react';
import useSessionUser from 'src/hooks/use-session-user';
import styled, { css } from 'styled-components';

export type BlankLayoutProps = {
  children: React.ReactNode;
};

const BlankLayout = ({ children }: BlankLayoutProps) => {
  const { t } = useTranslation('components.private-layout.nav');
  const { logOut } = useSessionUser();

  return (
    <Container testID="private-blank-layout">
      <Inner>
        <Header>
          <LogoFpCompact />
          <LinkButton onClick={logOut} iconComponent={IcoArrowRightSmall16}>
            {t('log-out')}
          </LinkButton>
        </Header>
        <Content>{children}</Content>
      </Inner>
    </Container>
  );
};

const Header = styled.header`
  ${({ theme }) => css`
    padding: ${theme.spacing[7]} 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  `};
`;

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Content = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
`;

export default BlankLayout;
