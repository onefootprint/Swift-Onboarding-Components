import { Container, Stack, Text } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Illustration from './components/illustration';

const titleVariants = {
  hidden: { opacity: 0, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: { delay: 0.8, duration: 0.5 },
  },
};

const Hero = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.customers.hero',
  });

  return (
    <HeroContainer>
      <Illustration />
      <TitleContainer initial="hidden" animate="visible" variants={titleVariants}>
        <Text variant="display-2" tag="h1">
          {t('title')}
        </Text>
        <Text variant="display-4" color="secondary" tag="h4">
          {t('subtitle')}
        </Text>
      </TitleContainer>
    </HeroContainer>
  );
};

const TitleContainer = styled(motion(Container))`
  ${({ theme }) => css`
    gap: ${theme.spacing[4]};
    flex-direction: column;
    text-align: center;
    align-items: center;
    justify-content: center;

    & > * {
      max-width: 600px;
    }
  `}
`;

const HeroContainer = styled(motion(Stack))`
  ${({ theme }) => css`
    flex-direction: column;
    gap: ${theme.spacing[9]};
    padding-top: ${theme.spacing[9]};
  `}
`;

export default Hero;
