import { Box, Container, Text } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Ctas from 'src/components/ctas';
import Illustration from './components/illustration/illustration';

const Hero = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.kyc' });
  return (
    <HeroContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: 'easeInOut' }}>
      <Illustration />
      <TitleContainer>
        <Text variant="display-2" textAlign="center" tag="h1">
          {t('title')}
        </Text>
        <Text variant="display-4" color="tertiary" tag="h2">
          {t('subtitle')}
        </Text>
        <Box paddingTop={3} width="100%">
          <Ctas />
        </Box>
      </TitleContainer>
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
  `}
`;

export default Hero;
