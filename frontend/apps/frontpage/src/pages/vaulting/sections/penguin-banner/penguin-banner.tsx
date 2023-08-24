import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Button, Container, media } from '@onefootprint/ui';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { isMobile } from 'react-device-detect';
/* eslint-disable import/no-extraneous-dependencies */
import ContactDialog from 'src/components/contact-dialog';

import SectionTitle from '../../components/section-title';

const PenguinBanner = () => {
  const { t } = useTranslation('pages.home.penguin-banner');
  const [showDialog, setShowDialog] = useState(false);

  const GET_FORM_URL =
    'https://getform.io/f/9f26eb67-51b3-4685-8dc4-8cf458e698e1';

  const handleClickTrigger = () => {
    setShowDialog(true);
  };

  const handleClose = () => {
    setShowDialog(false);
  };

  return (
    <SectionContainer>
      <StyledContainer>
        <PenguinImage
          src="/home/penguin-banner/penguin.svg"
          height={200}
          width={365}
          alt={t('alt-img')}
        />
        <SectionTitle
          variant={isMobile ? 'display-2' : 'display-1'}
          maxWidth={1200}
          multiline
        >
          {t('title')}
        </SectionTitle>
        <Buttons>
          <Link href={`${DASHBOARD_BASE_URL}/sign-up`}>
            <Button variant="primary">{t('cta')}</Button>
          </Link>
          <Button variant="secondary" onClick={handleClickTrigger}>
            {t('book-demo')}
          </Button>
        </Buttons>
      </StyledContainer>
      <ContactDialog
        url={GET_FORM_URL}
        open={showDialog}
        onClose={handleClose}
      />
    </SectionContainer>
  );
};

const SectionContainer = styled.section`
  position: relative;
  width: 100%;
  height: 100%;
`;

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
    padding: ${theme.spacing[9]} 0 ${theme.spacing[12]} 0;
    gap: ${theme.spacing[9]};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;

    ${media.greaterThan('md')`
      padding: ${theme.spacing[15]} 0 ${theme.spacing[15]} 0;
      gap: ${theme.spacing[10]};
    `}
  `}
`;

const Buttons = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
    width: 100%;

    button {
      width: 100%;
    }

    a {
      text-decoration: none;
    }

    ${media.greaterThan('md')`
      flex-direction: row;
      justify-content: center;

      button {
        width: auto;
      }
    `}
  `}
`;

const PenguinImage = styled(Image)`
  width: 90%;
  height: auto;
  object-fit: contain;

  ${media.greaterThan('md')`
    width: 100%;
    max-width: 365px;
  `}
`;
export default PenguinBanner;
