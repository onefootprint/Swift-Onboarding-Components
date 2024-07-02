import {
  IcoFootprintShield16,
  IcoIncognito16,
  IcoLink16,
  IcoSmartphone16,
  IcoSparkles16,
  IcoUserCircle16,
} from '@onefootprint/icons';
import { Box, Container, Stack, createFontStyles, media } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import AppClipIllustration from './components/app-clip-illustration';
import PasskeysIllustration from './components/passkeys-illustration';
import SectionLayout from './components/section-layout';

const APPLE_APP_CLIP_URL = 'https://developer.apple.com/app-clips/';
const ANDROID_APP_CLIP_URL = 'https://developer.android.com/topic/google-play-instant';
const PASSKEYS_URL = 'https://developer.apple.com/passkeys/';

const Leverage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.doc-scan.leverage' });
  return (
    <StyledContainer>
      <Stack direction="column" gap={5} maxWidth="700px" align="center" textAlign="center" justify="center">
        <Title>{t('title')}</Title>
        <Subtitle color="secondary">{t('subtitle')}</Subtitle>
      </Stack>
      <SectionLayout
        main={{
          title: t('app-clip.title'),
          subtitle: t('app-clip.subtitle'),
          mainCta: {
            label: t('app-clip.more-on-app-clips'),
            href: APPLE_APP_CLIP_URL,
          },
          secondaryCta: {
            label: t('app-clip.more-on-instant-clips'),
            href: ANDROID_APP_CLIP_URL,
          },
        }}
        illustration={<AppClipIllustration />}
        featureCards={[
          {
            title: t('app-clip.feature-cards.device-legitimacy.title'),
            description: t('app-clip.feature-cards.device-legitimacy.subtitle'),
            icon: IcoSmartphone16,
          },
          {
            title: t('app-clip.feature-cards.document-detection.title'),
            description: t('app-clip.feature-cards.document-detection.subtitle'),
            icon: IcoSparkles16,
          },
          {
            title: t('app-clip.feature-cards.duplicate-fraud.title'),
            description: t('app-clip.feature-cards.duplicate-fraud.subtitle'),
            icon: IcoIncognito16,
          },
        ]}
      />
      <SectionLayout
        $inverted
        main={{
          title: t('passkeys.title'),
          subtitle: t('passkeys.subtitle'),
          mainCta: {
            label: t('passkeys.more-on-passkeys'),
            href: PASSKEYS_URL,
          },
        }}
        illustration={<PasskeysIllustration />}
        featureCards={[
          {
            title: t('passkeys.feature-cards.ato.title'),
            description: t('passkeys.feature-cards.ato.subtitle'),
            icon: IcoFootprintShield16,
          },
          {
            title: t('passkeys.feature-cards.verify-signer-in.title'),
            description: t('passkeys.feature-cards.verify-signer-in.subtitle'),
            icon: IcoUserCircle16,
          },
          {
            title: t('passkeys.feature-cards.link-device-id.title'),
            description: t('passkeys.feature-cards.link-device-id.subtitle'),
            icon: IcoLink16,
          },
        ]}
      />
    </StyledContainer>
  );
};

const StyledContainer = styled(Container)`
${({ theme }) => css`
    max-width: 1100px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: ${theme.spacing[9]};
    padding-bottom: ${theme.spacing[9]};
    gap: ${theme.spacing[9]};

    ${media.greaterThan('md')`
      padding-top: ${theme.spacing[12]};
      padding-bottom: ${theme.spacing[9]};
      gap: ${theme.spacing[12]};
    `}
  `}
`;

const Title = styled(Box)`
    ${createFontStyles('display-2')}
`;

const Subtitle = styled(Box)`
    ${createFontStyles('display-4')}
`;

export default Leverage;
