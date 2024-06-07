import { Container, Grid, Stack, Text, createFontStyles, media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ContactButtons from 'src/components/contact-buttons/contact-buttons';
import SectionVerticalSpacer from 'src/components/section-vertical-spacer';
import styled, { css } from 'styled-components';

const PenguinBannerAuth = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.auth.stronger-auth',
  });

  return (
    <Container marginTop={12} marginBottom={12}>
      <SectionVerticalSpacer />
      <Layout minHeight="320px">
        <Stack align="center" justify="center">
          <Image src="/auth/banner/safe.png" width={256} height={195} alt="safe" />
        </Stack>
        <TextContainer direction="column" align="start" justify="center" maxWidth="800px" gap={5}>
          <Title>{t('title')}</Title>
          <Text variant="display-4" tag="h2" color="secondary" marginBottom={5}>
            {t('subtitle')}
          </Text>
          <ContactButtons bookADemoButton={t('book-a-demo')} signUpButton={t('sign-up-for-free')} />
        </TextContainer>
      </Layout>
      <SectionVerticalSpacer />
    </Container>
  );
};

const Layout = styled(Grid.Container)`
  ${({ theme }) => css`
    grid-template-columns: 1fr;
    grid-row-gap: ${theme.spacing[9]};

    ${media.greaterThan('md')`
      grid-template-columns: 1fr 2fr;
    `}
  `}
`;

const Title = styled.h2`
  ${createFontStyles('display-3')}

  ${media.greaterThan('md')`
    ${createFontStyles('display-2')}
  `}
`;

const TextContainer = styled(Stack)`
  ${({ theme }) => css`
    ${media.greaterThan('md')`
      padding-left: ${theme.spacing[12]};
    `}
  `}
`;

export default PenguinBannerAuth;
