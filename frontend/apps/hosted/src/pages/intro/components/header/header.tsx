import { HeaderTitle } from '@onefootprint/idv';
import {
  type BusinessBoKycData,
  CollectedKybDataOption,
  type HostedWorkflowRequest,
  type PublicOnboardingConfig,
  TriggerKind,
} from '@onefootprint/types';
import { Avatar, Box, Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useHostedMachine from 'src/hooks/use-hosted-machine';

const Header = () => {
  const [state] = useHostedMachine();
  const { businessBoKycData, onboardingConfig, workflowRequest } = state.context;
  const tenantName = onboardingConfig?.orgName ?? '';

  if (!onboardingConfig) {
    return null;
  }

  return (
    <Stack flexDirection="column" alignItems="center" justifyContent="center" rowGap={5}>
      <Avatar name={tenantName} size="xlarge" src={onboardingConfig?.logoUrl} />
      <Box marginTop={4}>
        {workflowRequest ? (
          <WorkflowRequestHeader
            tenantName={tenantName}
            onboardingConfig={onboardingConfig}
            workflowRequest={workflowRequest}
          />
        ) : businessBoKycData ? (
          <BoKycHeader tenantName={tenantName} businessBoKycData={businessBoKycData} />
        ) : (
          <DefaultHeader tenantName={tenantName} onboardingConfig={onboardingConfig} />
        )}
      </Box>
    </Stack>
  );
};

const WorkflowRequestHeader = ({
  tenantName,
  onboardingConfig,
  workflowRequest,
}: { tenantName: string; onboardingConfig: PublicOnboardingConfig; workflowRequest: HostedWorkflowRequest }) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.intro.header' });
  const { config } = workflowRequest;
  // TODO: eventually, add context with the tenant-provided `note` in this WFR

  if (config.kind === TriggerKind.Onboard) {
    if (config.data.recollectAttributes?.includes(CollectedKybDataOption.kycedBeneficialOwners)) {
      return (
        <HeaderTitle
          title={t('business-title', { tenantName })}
          subtitle={t('recollect-bos-subtitle', { tenantName })}
        />
      );
    }
    return <DefaultHeader tenantName={tenantName} onboardingConfig={onboardingConfig} />;
  }

  // Document workflow request
  const isBusiness = config.data.businessConfigs.length > 0;
  const titleKey = isBusiness ? 'business-title' : 'user-title';
  const subtitleKey = isBusiness ? 'business-document-subtitle' : 'user-document-subtitle';
  const count = config.data.businessConfigs.length + config.data.configs.length;
  return <HeaderTitle title={t(titleKey, { tenantName })} subtitle={t(subtitleKey, { tenantName, count })} />;
};

const BoKycHeader = ({
  tenantName,
  businessBoKycData,
}: { tenantName: string; businessBoKycData: BusinessBoKycData }) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.intro.header' });
  const { name: businessName, inviter } = businessBoKycData;
  const otherBoName = [inviter?.firstName, inviter?.lastName].join(' ');
  return (
    <HeaderTitle
      title={t('business-title', { tenantName })}
      subtitle={t('bo-kyc-subtitle', {
        otherBoName,
        businessName,
      })}
    />
  );
};

const DefaultHeader = ({
  tenantName,
  onboardingConfig,
}: { tenantName: string; onboardingConfig: PublicOnboardingConfig }) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.intro.header' });
  const isKyb = Boolean(onboardingConfig.isKyb);
  return (
    <HeaderTitle
      title={isKyb ? t('business-title', { tenantName }) : t('user-title', { tenantName })}
      subtitle={isKyb ? t('kyb-subtitle', { tenantName }) : t('kyc-subtitle', { tenantName })}
    />
  );
};

export default Header;
