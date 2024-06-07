'use client';

import { LogoFpCompact } from '@onefootprint/icons';
import { Box, Button, Divider, GoogleButton, Stack, Text, TextInput } from '@onefootprint/ui';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import PngPenguinCreate from '../../../../../public/auth/penguin-create.png';

const SignupContent = () => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });

  return (
    <Box
      backgroundColor="primary"
      borderRadius="lg"
      borderWidth={1}
      borderStyle="solid"
      borderColor="tertiary"
      padding={8}
      elevation={1}
      position="relative"
    >
      <PenguinImage alt={t('penguin')} height={90} priority src={PngPenguinCreate} width={135} />
      <Stack width="398px" direction="column" gap={7}>
        <LogoFpCompact />
        <Text variant="label-2">{t('create-your-account')}</Text>
        <GoogleButton size="large">{t('continue-with-google')}</GoogleButton>
        <Stack direction="row" center gap={4}>
          <Divider />
          <Text variant="body-4" color="tertiary">
            {t('or')}
          </Text>
          <Divider />
        </Stack>
        <Stack direction="column" gap={4}>
          <TextInput label={t('email-address')} placeholder={t('email-placeholder')} />
          <Button size="large" fullWidth>
            {t('continue-with-email')}
          </Button>
        </Stack>
        <Text color="secondary" variant="body-4" gap={2} display="inline-flex">
          <span>{t('already-have-an-account')}</span>
          <Link href="/auth/sign-in">{t('sign-in')}</Link>
        </Text>
      </Stack>
    </Box>
  );
};
const PenguinImage = styled(Image)`
  color: transparent;
  position: absolute;
  top: -90px;
  right: 24px;
`;

export default SignupContent;
