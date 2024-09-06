import CollectedInformation from '@/playbooks/components/collected-information';
import { AuthMethodKind, type OnboardingConfig } from '@onefootprint/types';
import { Box, Divider, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type AuthProps = Pick<OnboardingConfig, 'mustCollectData' | 'requiredAuthMethods' | 'allowUsTerritoryResidents'>;

const Auth = ({ requiredAuthMethods, mustCollectData, allowUsTerritoryResidents }: AuthProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'details.data-collection' });

  const hasAnyRequiredAuthMethods = !!requiredAuthMethods && requiredAuthMethods.length > 0;

  return (
    <Stack direction="column" gap={5}>
      <CollectedInformation
        title={t('sign-up')}
        options={{
          emailAddress: mustCollectData.includes('email'),
          phoneNumber: mustCollectData.includes('phone_number'),
        }}
      />
      {hasAnyRequiredAuthMethods ? (
        <CollectedInformation
          title={t('otp')}
          options={{
            phoneOTP: requiredAuthMethods?.includes(AuthMethodKind.phone),
            emailOTP: requiredAuthMethods?.includes(AuthMethodKind.email),
          }}
        />
      ) : null}
      {allowUsTerritoryResidents ? (
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
      ) : null}
    </Stack>
  );
};

export default Auth;
