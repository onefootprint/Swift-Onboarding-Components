'use client';

import { ThemedLogoFpDefault } from '@onefootprint/icons';
import { Button, Text } from '@onefootprint/ui';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { DEFAULT_PUBLIC_ROUTE } from '@/config/constants';

const MagicLinkSentContent = ({ email }: { email: string }) => {
  const router = useRouter();
  const { t } = useTranslation('common', { keyPrefix: 'auth' });

  return (
    <Container>
      <Inner>
        <ThemedLogoFpDefault />
        <Text variant="label-1" color="primary">
          {t('magic-link-sent')}
        </Text>
        <Text variant="body-2">{t('magic-link-sent-instructions', { email })}</Text>
        <Button onClick={() => router.push(DEFAULT_PUBLIC_ROUTE)} fullWidth>
          {t('back')}
        </Button>
      </Inner>
    </Container>
  );
};

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
  text-align: center;
`;

const Inner = styled.div`
  ${({ theme }) => css`
    display: flex;
    max-width: 350px;
    flex-direction: column;
    gap: ${theme.spacing[7]};
    align-items: center;
  `}
`;

export default MagicLinkSentContent;
