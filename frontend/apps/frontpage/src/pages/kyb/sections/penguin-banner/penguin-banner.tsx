import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import {
  Button,
  Container,
  createFontStyles,
  media,
  Stack,
} from '@onefootprint/ui';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import ContactDialog from 'src/components/contact-dialog';

const PenguinBanner = () => {
  const { t } = useTranslation('pages.kyb.banner');
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
        <Stack direction="column" gap={9} align="center">
          <Title>{t('title')}</Title>
          <Buttons>
            <Link href={`${DASHBOARD_BASE_URL}/sign-up`}>
              <Button variant="primary">{t('get-started')}</Button>
            </Link>
            <Button variant="secondary" onClick={handleClickTrigger}>
              {t('book-a-demo')}
            </Button>
          </Buttons>
        </Stack>
      </StyledContainer>
      <ContactDialog
        url={GET_FORM_URL}
        open={showDialog}
        onClose={handleClose}
      />
    </SectionContainer>
  );
};

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
    padding: ${theme.spacing[13]} 0 ${theme.spacing[12]} 0;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[10]};
    align-items: center;
    justify-content: center;
    text-align: center;

    ${media.greaterThan('md')`
      padding: ${theme.spacing[15]} 0;
    `}
  `}
`;

const PenguinImage = styled(Image)`
  max-width: 80%;
`;

const SectionContainer = styled.section`
  position: relative;
  width: 100%;
  height: 100%;
`;

const Title = styled.h2`
  ${({ theme }) => css`
    ${createFontStyles('display-3')}
    color: ${theme.color.primary};

    ${media.greaterThan('md')`
      ${createFontStyles('display-1')}
      max-width: 967px;
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

export default PenguinBanner;
