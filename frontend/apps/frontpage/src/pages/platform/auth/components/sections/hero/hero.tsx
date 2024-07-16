import { Container, Text, media } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
/* eslint-disable import/no-extraneous-dependencies */
import styled, { css } from 'styled-components';

import Ctas from 'src/components/ctas';
import Illustration from './components/illustration/illustration';

const Hero = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.auth.hero' });

  return (
    <HeroContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: 'easeInOut' }}>
      <Illustration />
      <TitleContainer>
        <Text variant="display-2" textAlign="center">
          {t('title')}
        </Text>
        <Text variant="display-4" color="tertiary">
          {t('subtitle')}
        </Text>
      </TitleContainer>
      <Buttons>
        <Ctas
          labels={{
            primary: t('sign-up-for-free'),
            secondary: t('book-a-demo'),
          }}
        />
      </Buttons>
    </HeroContainer>
  );
};

const HeroContainer = styled(motion.div)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[9]};
  `}
`;

const TitleContainer = styled(Container)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[4]};
    text-align: center;

    ${media.greaterThan('md')`
      text-align: left;
    `}
  `}
`;

const Buttons = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[4]};

    a {
      text-decoration: none;
    }
  `}
`;

export default Hero;
