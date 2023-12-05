import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Button, Container, media, Typography } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import Link from 'next/link';
import React, { useState } from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import ContactDialog from 'src/components/contact-dialog';

import Illustration from './components/illustration/illustration';

const GET_FORM_URL =
  'https://getform.io/f/9f26eb67-51b3-4685-8dc4-8cf458e698e1';

const Hero = () => {
  const { t } = useTranslation('pages.auth.hero');
  const [showDialog, setShowDialog] = useState(false);
  const handleClickTrigger = () => {
    setShowDialog(true);
  };
  const handleClose = () => {
    setShowDialog(false);
  };
  return (
    <HeroContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <Illustration />
      <TitleContainer>
        <Typography variant="display-2" sx={{ textAlign: 'center' }}>
          {t('title')}
        </Typography>
        <Typography variant="display-4" color="tertiary">
          {t('subtitle')}
        </Typography>
      </TitleContainer>
      <Buttons>
        <Link href={`${DASHBOARD_BASE_URL}/sign-up`}>
          <Button variant="primary">{t('sign-up-for-free')}</Button>
        </Link>
        <Button variant="secondary" onClick={handleClickTrigger}>
          {t('book-a-demo')}
        </Button>
      </Buttons>
      <ContactDialog
        url={GET_FORM_URL}
        open={showDialog}
        onClose={handleClose}
      />
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
