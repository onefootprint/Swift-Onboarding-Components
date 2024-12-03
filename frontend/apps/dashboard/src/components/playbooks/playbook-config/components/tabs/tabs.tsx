import { tabsRouterSchema } from '@/playbooks/utils/schema';
import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import type { OnboardingConfig } from '@onefootprint/types';
import { Stack, Tabs as UITabs } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import useGetQueryParam from 'src/hooks/use-query-param';
import DataCollection from './components/data-collection';
import Information from './components/information';
import Rules from './components/rules';
import Settings from './components/settings';
import VerificationChecks from './components/verification-checks';
import useTabOptions from './hooks/use-tab-options';

export type TabsProps = {
  playbook: OnboardingConfiguration;
  isTabsDisabled: boolean;
  toggleDisableHeading: (disable: boolean) => void;
  hideSettings: boolean;
};

const Tabs = ({ playbook, isTabsDisabled, toggleDisableHeading, hideSettings }: TabsProps) => {
  const { tab } = useGetQueryParam(tabsRouterSchema);
  const router = useRouter();
  const options = useTabOptions(playbook, hideSettings);

  const handleChange = (tab: string) => {
    router.replace({
      query: { ...router.query, tab },
    });
  };

  return (
    <Stack flexDirection="column" gap={8}>
      <UITabs options={options} onChange={handleChange} disabled={isTabsDisabled} defaultValue={tab} />
      {tab === 'data' && <DataCollection playbook={playbook} />}
      {tab === 'verification-checks' && <VerificationChecks playbook={playbook} />}
      {tab === 'rules' && <Rules playbook={playbook as OnboardingConfig} toggleDisableHeading={toggleDisableHeading} />}
      {tab === 'settings' && <Settings playbook={playbook} />}
      {tab === 'information' && <Information playbook={playbook} />}
    </Stack>
  );
};

export default Tabs;
