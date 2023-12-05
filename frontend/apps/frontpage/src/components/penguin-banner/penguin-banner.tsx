import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Container, createFontStyles, media, Stack } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';

import ContactButtons from '../contact-buttons';

type PenguinBannerProps = {
  imgSrc?: string;
  section: 'home' | 'vaulting' | 'kyc' | 'kyb';
  isDarkTheme?: boolean;
};

const PenguinBanner = ({
  imgSrc = '/home/penguin-banner/home.svg',
  section = 'home',
  isDarkTheme,
}: PenguinBannerProps) => {
  const { t } = useTranslation('components.penguin-banner');

  return (
    <StyledContainer>
      <Stack direction="column" gap={10} align="center" justify="center">
        <Illustration
          src={imgSrc}
          height={600}
          width={900}
          alt={t(`${section}.alt-img`)}
        />
        <Stack
          direction="column"
          gap={9}
          textAlign="center"
          align="center"
          justify="center"
          maxWidth="960px"
        >
          <Title isDarkTheme={isDarkTheme}>{t(`${section}.title`)}</Title>
          <ContactButtons
            bookADemoButton={t(`${section}.secondary`)}
            signUpButton={t(`${section}.primary`)}
            justify="center"
          />
        </Stack>
      </Stack>
    </StyledContainer>
  );
};

const Title = styled.h2<{ isDarkTheme?: boolean }>`
  ${({ theme, isDarkTheme }) => css`
    color: ${isDarkTheme ? theme.color.quinary : theme.color.primary};
    ${createFontStyles('display-2')}

    ${media.greaterThan('md')`
      ${createFontStyles('display-1')}
    `}
  `}
`;

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
    padding: ${theme.spacing[9]} 0 ${theme.spacing[10]} 0;

    ${media.greaterThan('md')`
      padding: ${theme.spacing[11]} 0 ${theme.spacing[12]} 0;
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

export default PenguinBanner;
