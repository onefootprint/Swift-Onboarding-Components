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

type PenguinBannerProps = {
  imgSrc?: string;
  section: 'home' | 'vaulting' | 'kyc' | 'kyb';
};

const PenguinBanner = ({
  imgSrc = '/home/penguin-banner/home.svg',
  section = 'home',
}: PenguinBannerProps) => {
  const { t } = useTranslation('components.penguin-banner');
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
    <StyledContainer>
      <Stack direction="column" gap={10} align="center" justify="center">
        <Illustration
          src={imgSrc}
          height={600}
          width={900}
          alt={t(`${section}.alt-img`)}
        />
        <Stack direction="column" gap={9} align="center">
          <Title>{t(`${section}.title`)}</Title>
          <Buttons>
            <Link href={`${DASHBOARD_BASE_URL}/sign-up`}>
              <Button variant="primary">{t(`${section}.primary`)}</Button>
            </Link>
            <Button variant="secondary" onClick={handleClickTrigger}>
              {t(`${section}.secondary`)}
            </Button>
          </Buttons>
        </Stack>
      </Stack>
      <ContactDialog
        url={GET_FORM_URL}
        open={showDialog}
        onClose={handleClose}
      />
    </StyledContainer>
  );
};

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
    padding: ${theme.spacing[9]} 0 ${theme.spacing[10]} 0;

    ${media.greaterThan('md')`
      padding: ${theme.spacing[11]} 0 ${theme.spacing[12]} 0;
    `}
  `}
`;

const Title = styled.h2`
  ${({ theme }) => css`
    ${createFontStyles('display-3')}
    color: ${theme.color.primary};
    text-align: center;

    ${media.greaterThan('md')`
      ${createFontStyles('display-1')}
      max-width: 967px;
    `}
  `}
`;

const Illustration = styled(Image)`
  object-fit: contain;
  max-height: 420px;
  height: fit-content;
  width: 100%;

  ${media.greaterThan('md')`
    max-width: 967px;
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
