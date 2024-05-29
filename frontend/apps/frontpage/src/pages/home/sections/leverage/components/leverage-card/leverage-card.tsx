import {
  IcoFootprintShield24,
  IcoIncognito24,
  IcoLink24,
  IcoSmartphone224,
  IcoSparkles24,
  IcoUserCircle24,
} from '@onefootprint/icons';
import { Box, createFontStyles, media, Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Bullet from './components/bullet';
import MockupVideo from './components/mockup-video';

type LeverageCardProps = {
  variant: 'app-clip' | 'passkeys';
  videoSrc: string;
  $inverted?: boolean;
};

const appclipBullets = [
  {
    translationKey: 'real-phone',
    icon: IcoSmartphone224,
  },
  {
    translationKey: 'device-attestation',
    icon: IcoSparkles24,
  },
  {
    translationKey: 'duplicate-fraud',
    icon: IcoIncognito24,
  },
];
const passkeyBullets = [
  {
    translationKey: 'prevent-ato',
    icon: IcoFootprintShield24,
  },
  {
    translationKey: 'same-person',
    icon: IcoUserCircle24,
  },
  {
    translationKey: 'link-kyc-and-auth',
    icon: IcoLink24,
  },
];

const LeverageCard = ({ variant, videoSrc, $inverted }: LeverageCardProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.leverage',
  });

  const bullets = variant === 'app-clip' ? appclipBullets : passkeyBullets;

  return (
    <CardContainer $inverted={$inverted}>
      <MockupVideo videoSrc={videoSrc} shouldPlay />
      <Stack align="center" justify="flex-start">
        <TextContainer>
          <Stack direction="column" gap={4}>
            <Chip tag="h3" variant={variant}>
              {variant === 'app-clip' ? 'Modern' : 'Secure'}
            </Chip>
            <Text variant="heading-2" tag="h3">
              {t(`${variant}.title` as unknown as ParseKeys<'common'>)}
            </Text>
            <Text variant="body-1" color="secondary" tag="h4">
              {t(`${variant}.subtitle` as unknown as ParseKeys<'common'>)}
            </Text>
          </Stack>
          <Stack
            direction="column"
            gap={3}
            paddingTop={2}
            width="100%"
            tag="ul"
          >
            {bullets.map(bullet => (
              <Bullet key={bullet.translationKey} icon={bullet.icon}>
                {t(
                  `${variant}.${bullet.translationKey}` as unknown as ParseKeys<'common'>,
                )}
              </Bullet>
            ))}
          </Stack>
        </TextContainer>
      </Stack>
    </CardContainer>
  );
};

const getGridArea = ($inverted: boolean | undefined) =>
  $inverted ? 'text video' : 'video text';

const CardContainer = styled(Box)<{ $inverted?: boolean }>`
  ${({ theme, $inverted }) => {
    const gridArea = getGridArea($inverted);
    return css`
      background-color: ${theme.backgroundColor.primary};=
      display: reverse-flex;
      flex-direction: column;

      ${media.greaterThan('md')`
        display: grid;
        width: 100%;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr;
        grid-template-areas: '${gridArea}';
        grid-column-gap: ${theme.spacing[11]};
      `}
    `;
  }}
`;

const TextContainer = styled(Stack)`
  ${({ theme }) => css`
    grid-area: text;
    flex-direction: column;
    gap: ${theme.spacing[4]};
    padding: ${theme.spacing[9]} ${theme.spacing[5]};
    justify-content: center;
    max-width: 500px;
  `}
`;

const Chip = styled(Box)<{ variant: 'app-clip' | 'passkeys' }>`
  ${({ theme, variant }) => css`
    ${createFontStyles('label-2')}
    color: ${variant === 'app-clip' ? theme.color.info : theme.color.success};
    border-color: ${variant === 'app-clip'
      ? theme.color.info
      : theme.color.success};
    width: fit-content;
  `}
`;

export default LeverageCard;
