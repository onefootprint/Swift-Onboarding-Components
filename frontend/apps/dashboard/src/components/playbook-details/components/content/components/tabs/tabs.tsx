import { tabsRouterSchema } from '@/playbooks/utils/schema';
import type { PlaybookTabs } from '@/playbooks/utils/schema/schema';
import { type OnboardingConfig, OnboardingConfigKind } from '@onefootprint/types';
import { Stack, Tabs as UITabs } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import useGetQueryParam from 'src/hooks/use-query-param';
import DataCollection from './components/data-collection';
import Information from './components/information';
import Rules from './components/rules';
import Settings from './components/settings';
import VerificationChecks from './components/verification-checks';

export type TabsProps = {
  playbook: OnboardingConfig;
  isTabsDisabled: boolean;
  toggleDisableHeading: (disable: boolean) => void;
};

type OptionsProps = { label: string; value: PlaybookTabs }[];

const Tabs = ({ playbook, isTabsDisabled, toggleDisableHeading }: TabsProps) => {
  const { t } = useTranslation('playbook-details');
  const { tab } = useGetQueryParam(tabsRouterSchema);
  const router = useRouter();

  const options: OptionsProps =
    playbook.kind === OnboardingConfigKind.document
      ? [
          { value: 'data', label: t('tabs.data-collection') },
          { value: 'rules', label: t('tabs.rules') },
        ]
      : [
          { value: 'data', label: t('tabs.data-collection') },
          { value: 'verification-checks', label: t('tabs.verification-checks') },
          { value: 'rules', label: t('tabs.rules') },
          { value: 'settings', label: t('tabs.settings') },
          { value: 'information', label: t('tabs.information') },
        ];

  const handleChange = (tab: PlaybookTabs) => {
    router.replace({
      query: { ...router.query, tab },
    });
  };

  return (
    <Stack flexDirection="column" gap={8}>
      <UITabs options={options} onChange={handleChange} disabled={isTabsDisabled} defaultValue={tab} />
      {tab === 'data' && <DataCollection playbook={playbook} />}
      {tab === 'verification-checks' && <VerificationChecks playbook={playbook} />}
      {tab === 'rules' && <Rules playbook={playbook} toggleDisableHeading={toggleDisableHeading} />}
      {tab === 'settings' && <Settings playbook={playbook} />}
      {tab === 'information' && <Information playbook={playbook} />}
    </Stack>
  );
};

export default Tabs;
