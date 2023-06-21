import { useTranslation } from '@onefootprint/hooks';
import { IcoArrowRightSmall16, LogoFpCompact } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Container, LinkButton } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import React from 'react';

export type BlankLayoutProps = {
  children: React.ReactNode;
};

const BlankLayout = ({ children }: BlankLayoutProps) => {
  const { t } = useTranslation('components.private-layout.nav');
  const router = useRouter();

  const handleLogout = () => {
    router.push('/logout');
  };

  return (
    <motion.div
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
    >
      <Container testID="private-blank-layout">
        <Inner>
          <Header>
            <LogoFpCompact />
            <LinkButton
              onClick={handleLogout}
              iconComponent={IcoArrowRightSmall16}
            >
              {t('log-out')}
            </LinkButton>
          </Header>
          <Content>{children}</Content>
        </Inner>
      </Container>
    </motion.div>
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
