import {
  Box,
  Container,
  createFontStyles,
  media,
  Stack,
} from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import Image from 'next/image';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import ContactButtons from '../contact-buttons';
import SectionVerticalSpacer from '../section-vertical-spacer';

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
  const { t } = useTranslation('common', {
    keyPrefix: 'components.penguin-banner',
  });

  return (
    <StyledContainer>
      <SectionVerticalSpacer />
      <Stack direction="column" gap={11} align="center" justify="center">
        <Illustration
          src={imgSrc}
          height={600}
          width={900}
          alt={t(`${section}.alt-img` as ParseKeys<'common'>)}
        />
        <Stack
          direction="column"
          gap={9}
          textAlign="center"
          align="center"
          justify="center"
          maxWidth="960px"
        >
          <Title isDarkTheme={isDarkTheme} tag="h2" maxWidth="720px">
            {t(`${section}.title` as ParseKeys<'common'>)}
          </Title>
          <ContactButtons
            bookADemoButton={t(`${section}.secondary` as ParseKeys<'common'>)}
            signUpButton={t(`${section}.primary` as ParseKeys<'common'>)}
            justify="center"
          />
        </Stack>
      </Stack>
      <SectionVerticalSpacer />
    </StyledContainer>
  );
};

const Title = styled(Box)<{ isDarkTheme?: boolean }>`
  ${({ theme, isDarkTheme }) => css`
    color: ${isDarkTheme ? theme.color.quinary : theme.color.primary};
    ${createFontStyles('display-3')}

    ${media.greaterThan('md')`
      ${createFontStyles('display-2')}
    `}
  `}
`;

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
    padding: ${theme.spacing[9]} 0 ${theme.spacing[10]} 0;

    ${media.greaterThan('md')`
      padding: ${theme.spacing[11]} 0 ${theme.spacing[12]} 0;
      align-items: center;
      justify-content: center;
    `}
  `}
`;

const Illustration = styled(Image)`
  object-fit: contain;
  max-height: 380px;
  height: fit-content;
  width: 100%;

  ${media.greaterThan('md')`
    max-width: 967px;
  `}
`;

export default PenguinBanner;
