import { HeaderTitle } from '@onefootprint/idv';
import { Avatar, Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useHostedMachine from 'src/hooks/use-hosted-machine';

const Header = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.intro.header' });
  const [state] = useHostedMachine();
  const { businessBoKycData, onboardingConfig } = state.context;
  const isKyb = Boolean(onboardingConfig?.isKyb);

  const { name: businessName, inviter } = businessBoKycData || {};
  const otherBoName = [inviter?.firstName, inviter?.lastName].join(' ');
  const tenantName = onboardingConfig?.orgName ?? '';

  return (
    <Stack flexDirection="column" alignItems="center" justifyContent="center" rowGap={5}>
      <Avatar name={tenantName} size="xlarge" src={onboardingConfig?.logoUrl} />
      {businessBoKycData ? (
        <HeaderTitle
          title={t('bo-kyc.title', { tenantName })}
          subtitle={t('bo-kyc.subtitle', {
            otherBoName,
            businessName,
          })}
          marginTop={4}
        />
      ) : (
        <HeaderTitle
          title={isKyb ? t('kyb.title', { tenantName }) : t('kyc.title', { tenantName })}
          subtitle={isKyb ? t('kyb.subtitle', { tenantName }) : t('kyc.subtitle', { tenantName })}
          marginTop={4}
        />
      )}
    </Stack>
  );
};

export default Header;
