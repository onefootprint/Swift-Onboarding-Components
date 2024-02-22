import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { Button, Container, createFontStyles, media } from '@onefootprint/ui';
import Link from 'next/link';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
/* eslint-disable import/no-extraneous-dependencies */
import ContactDialog from 'src/components/contact-dialog';
import styled, { css } from 'styled-components';

const GET_FORM_URL =
  'https://getform.io/f/9f26eb67-51b3-4685-8dc4-8cf458e698e1';

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
    <Container>
      <SectionContainer>
        <TitleContainer>
          <Title>{t('title')}</Title>
          <Subtitle>{t('subtitle')}</Subtitle>
        </TitleContainer>
        <Buttons>
          <Link href={`${DASHBOARD_BASE_URL}/sign-up`}>
            <Button variant="primary">{t('get-started')}</Button>
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
