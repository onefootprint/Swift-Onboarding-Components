import CollectedInformation from '@/playbooks/components/collected-information';
import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { Box, Divider, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type AuthOnlyProps = {
  playbook: OnboardingConfiguration;
};

const AuthOnly = ({ playbook: { requiredAuthMethods, mustCollectData, allowUsTerritoryResidents } }: AuthOnlyProps) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'data-collection' });

  return (
    <Stack gap={8} direction="column">
      <Stack gap={8} direction="column">
        <Stack gap={4} direction="column">
          <Text variant="label-2">{t('section-title')}</Text>
          <Divider />
        </Stack>
        <Stack direction="column" gap={8}>
          <CollectedInformation
            title={t('sign-up')}
            options={{
              emailAddress: mustCollectData.includes('email'),
              phoneNumber: mustCollectData.includes('phone_number'),
            }}
          />
          {!!requiredAuthMethods && requiredAuthMethods.length > 0 ? (
            <CollectedInformation
              title={t('otp')}
              options={{
                phoneOTP: requiredAuthMethods?.includes('phone'),
                emailOTP: requiredAuthMethods?.includes('email'),
              }}
            />
          ) : null}
          {allowUsTerritoryResidents ? (
            <footer>
              <Box marginTop={5} marginBottom={5}>
                <Divider variant="secondary" />
              </Box>
              <Text variant="label-2" color="primary">
                {t('us-territories.label')}{' '}
                <Text variant="label-2" color="tertiary" tag="span">
                  {t('us-territories.content')}
                </Text>
              </Text>
            </footer>
          ) : null}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default AuthOnly;
