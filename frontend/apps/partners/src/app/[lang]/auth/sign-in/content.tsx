'use client';

import { LogoFpCompact } from '@onefootprint/icons';
import type { NextToast } from '@onefootprint/ui';
import { Box, Button, Divider, GoogleButton, Stack, Text, TextInput, useToast } from '@onefootprint/ui';
import type { TFunction } from 'i18next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { getFormElementValue } from '@/helpers';
import authMagicLink from '@/queries/auth-magic-link';

import PngPenguinLogin from '../../../../../public/auth/penguin-login.png';

type T = TFunction<'common', 'auth'>;

const getLoginFailedTexts =
  (desc: 'failed-google' | 'failed-email') =>
  (t: T): NextToast => ({
    description: t(desc),
    title: t('login-failed'),
    variant: 'error',
  });

const getFailedGoogleTexts = getLoginFailedTexts('failed-google');
const getFailedEmailTexts = getLoginFailedTexts('failed-email');
const getEmail = getFormElementValue('input[type="email"]');

const SignInContent = () => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const [isLoginInProgress, setIsLoginInProgress] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handleGoogleButtonClick = async () => {
    setIsLoginInProgress(true);
    try {
      const redirect = `${window.location.origin}/auth`;
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/partner/auth/google_oauth?redirect_url=${redirect}`;
      window.location.href = url;
    } catch (_e) {
      toast.show(getFailedGoogleTexts(t));
    } finally {
      setIsLoginInProgress(false);
    }
  };

  const handleEmailFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = getEmail(e);
    if (!email) return;

    setIsLoginInProgress(true);
    try {
      if (email) {
        await authMagicLink(email);
        router.push(`/auth/link-sent?email=${email}`);
      }
    } catch (_e) {
      toast.show(getFailedEmailTexts(t));
    } finally {
      setIsLoginInProgress(false);
    }
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
      <PenguinImage alt={t('penguin')} height={115} priority src={PngPenguinLogin} width={99} />
      <Stack width="398px" direction="column" gap={7}>
        <LogoFpCompact />
        <Text variant="label-2">{t('sign-in-to-footprint')}</Text>
        <GoogleButton
          disabled={isLoginInProgress}
          loading={isLoginInProgress}
          onClick={handleGoogleButtonClick}
          size="large"
          type="submit"
        >
          {t('continue-with-google')}
        </GoogleButton>
        <Stack direction="row" center gap={4}>
          <Divider />
          <Text variant="body-4">{t('or')}</Text>
          <Divider />
        </Stack>
        <form onSubmit={handleEmailFormSubmit}>
          <Stack direction="column" gap={4}>
            <TextInput
              label={t('email-address')}
              name="email-field"
              placeholder={t('email-placeholder')}
              type="email"
            />
            <Button disabled={isLoginInProgress} fullWidth loading={isLoginInProgress} size="large" type="submit">
              {t('continue-with-email')}
            </Button>
          </Stack>
        </form>
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
