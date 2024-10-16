import CollectedInformation from '@/playbooks/components/collected-information';
import { AuthMethodKind, type OnboardingConfig } from '@onefootprint/types';
import { Box, Divider, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type AuthOnlyProps = { playbook: OnboardingConfig };

const AuthOnly = ({ playbook: { requiredAuthMethods, mustCollectData, allowUsTerritoryResidents } }: AuthOnlyProps) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'data-collection' });

  return (
    <Container>
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
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[8]};
  `}
`;

export default AuthOnly;
