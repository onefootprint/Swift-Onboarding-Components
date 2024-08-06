import CollectedInformation from '@/playbooks/components/collected-information';
import { AuthMethodKind, OnboardingConfig } from '@onefootprint/types';
import { Box, Divider, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

type AuthProps = Pick<OnboardingConfig, 'mustCollectData' | 'requiredAuthMethods' | 'allowUsTerritoryResidents'>;

const Auth = ({ requiredAuthMethods, mustCollectData, allowUsTerritoryResidents }: AuthProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'details.data-collection' });

  return (
    <Stack direction="column" gap={5}>
      <CollectedInformation
        title={t('sign-up')}
        options={{
          emailAddress: mustCollectData.includes('email'),
          phoneNumber: mustCollectData.includes('phone_number'),
        }}
      />
      <CollectedInformation
        title={t('sign-in')}
        options={{
          phoneOTP: requiredAuthMethods?.includes(AuthMethodKind.phone),
          emailOTP: requiredAuthMethods?.includes(AuthMethodKind.email),
        }}
      />
      {allowUsTerritoryResidents && (
        <footer>
          <Box marginTop={5} marginBottom={5}>
            <Divider variant="secondary" />
          </Box>
          <Text variant="label-3" color="primary">
            {t('us-territories.label')}{' '}
            <Text variant="label-3" color="tertiary" tag="span">
              {t('us-territories.content')}
            </Text>
          </Text>
        </footer>
      )}
    </Stack>
  );
};

export default Auth;
