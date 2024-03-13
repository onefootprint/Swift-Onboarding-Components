'use client';

import { LogoFpCompact } from '@onefootprint/icons';
import {
  Box,
  Button,
  Divider,
  GoogleButton,
  Stack,
  Text,
  TextInput,
} from '@onefootprint/ui';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import PngPenguinLogin from '../../../../../public/auth/penguin-login.png';

const SignInContent = () => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const handleSignIn = () => {
    // const redirect = `${window.location.origin}/auth`;
    // const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/auth/google_oauth?redirect_url=${redirect}`;
    window.location.href =
      'https://api.dev.onefootprint.com/org/auth/google_oauth?redirect_url=http://localhost:3012/auth';
  };

  return (
    <Box
      backgroundColor="primary"
      borderRadius="lg"
      borderWidth={1}
      borderColor="tertiary"
      padding={8}
      elevation={1}
      position="relative"
    >
      <PenguinImage
        alt={t('penguin')}
        height={115}
        priority
        src={PngPenguinLogin}
        width={99}
      />
      <Stack width="398px" direction="column" gap={7}>
        <LogoFpCompact />
        <Text variant="label-2">{t('sign-in-to-footprint')}</Text>
        <GoogleButton size="large" onClick={handleSignIn}>
          {t('continue-with-google')}
        </GoogleButton>
        <Stack direction="row" center gap={4}>
          <Divider />
          <Text variant="body-4">{t('or')}</Text>
          <Divider />
        </Stack>
        <Stack direction="column" gap={4}>
          <TextInput
            label={t('email-address')}
            placeholder={t('email-placeholder')}
          />
          <Button fullWidth size="large">
            {t('continue-with-email')}
          </Button>
        </Stack>
        <Text color="secondary" variant="body-4" gap={2} display="inline-flex">
          <span>{t('do-not-have-an-account')}</span>
          <Link href="/auth/sign-up">{t('sign-up')}</Link>
        </Text>
      </Stack>
    </Box>
  );
};

const PenguinImage = styled(Image)`
  color: transparent;
  position: absolute;
  top: -115px;
  right: 24px;
`;

export default SignInContent;
