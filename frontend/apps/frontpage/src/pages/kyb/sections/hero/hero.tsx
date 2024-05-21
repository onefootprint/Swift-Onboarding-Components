import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import {
  Button,
  Container,
  createFontStyles,
  media,
  Stack,
} from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
/* eslint-disable import/no-extraneous-dependencies */
import ContactDialog from 'src/components/contact-dialog';
import styled, { css } from 'styled-components';

const GET_FORM_URL = 'https://getform.io/f/pbygomeb';

const Hero = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.kyb.hero' });
  const [showDialog, setShowDialog] = useState(false);
  const handleClickTrigger = () => {
    setShowDialog(true);
  };
  const handleClose = () => {
    setShowDialog(false);
  };
  return (
    <Container align="center" justify="center">
      <SectionContainer>
        <TitleContainer>
          <Title>{t('title')}</Title>
          <Subtitle>{t('subtitle')}</Subtitle>
        </TitleContainer>
        <Stack gap={4}>
          <Button
            size="large"
            variant="primary"
            onClick={() =>
              window.open(`${DASHBOARD_BASE_URL}/sign-up`, '_blank')
            }
          >
            {t('get-started')}
          </Button>
          <Button variant="secondary" size="large" onClick={handleClickTrigger}>
            {t('book-a-demo')}
          </Button>
        </Stack>
        <ContactDialog
          url={GET_FORM_URL}
          open={showDialog}
          onClose={handleClose}
        />
      </SectionContainer>
    </Container>
  );
};

const SectionContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[8]};
    padding: ${theme.spacing[10]} 0 ${theme.spacing[12]} 0;

    ${media.greaterThan('md')`
      padding: ${theme.spacing[11]} 0 ${theme.spacing[13]} 0;
    `}
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

const Title = styled.h1`
  ${({ theme }) => css`
    ${createFontStyles('display-2')}
    color: ${theme.color.primary};
    text-align: center;
  `}
`;

const Subtitle = styled.h2`
  ${({ theme }) => css`
    ${createFontStyles('display-4')}
    color: ${theme.color.tertiary};
    text-align: center;
  `}
`;

export default Hero;
