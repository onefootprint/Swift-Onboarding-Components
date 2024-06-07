import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { Button, Stack, Text } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
/* eslint-disable import/no-extraneous-dependencies */
import ContactDialog from 'src/components/contact-dialog';
import styled, { css } from 'styled-components';

import Illustration from './components/illustration/illustration';

const GET_FORM_URL = 'https://getform.io/f/pbygomeb';

const Hero = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.kyc' });
  const [showDialog, setShowDialog] = useState(false);
  const handleClickTrigger = () => {
    setShowDialog(true);
  };
  const handleClose = () => {
    setShowDialog(false);
  };
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
      </TitleContainer>
      <Stack gap={4} align="center">
        <Button
          variant="primary"
          size="large"
          onClick={() => window.open(`${DASHBOARD_BASE_URL}/authentication/sign-up`, '_blank')}
        >
          {t('get-started')}
        </Button>
        <Button variant="secondary" onClick={handleClickTrigger} size="large">
          {t('book-a-demo')}
        </Button>
      </Stack>
      <ContactDialog url={GET_FORM_URL} open={showDialog} onClose={handleClose} />
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

const TitleContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[4]};
  `}
`;

export default Hero;
