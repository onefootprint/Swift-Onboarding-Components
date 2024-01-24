import styled, { css } from '@onefootprint/styled';
import {
  Container,
  createFontStyles,
  Grid,
  media,
  Stack,
  Typography,
} from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ContactButtons from 'src/components/contact-buttons/contact-buttons';

const PenguinBannerAuth = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.auth.stronger-auth',
  });

  return (
    <Container
      sx={{
        marginTop: 12,
        marginBottom: 12,
      }}
    >
      <Layout minHeight="320px">
        <Stack align="center" justify="center">
          <Image
            src="/auth/banner/safe.png"
            width={256}
            height={195}
            alt="safe"
          />
        </Stack>
        <TextContainer
          direction="column"
          align="start"
          justify="center"
          maxWidth="800px"
          gap={5}
        >
          <Title>{t('title')}</Title>
          <Typography
            variant="display-4"
            as="h2"
            color="secondary"
            sx={{
              marginBottom: 5,
            }}
          >
            {t('subtitle')}
          </Typography>
          <ContactButtons
            bookADemoButton={t('book-a-demo')}
            signUpButton={t('sign-up-for-free')}
          />
        </TextContainer>
      </Layout>
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
