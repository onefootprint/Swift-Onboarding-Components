import { tabsRouterSchema } from '@/playbooks/utils/schema';
import { PlaybookTabs } from '@/playbooks/utils/schema/schema';
import { type OnboardingConfig, OnboardingConfigKind } from '@onefootprint/types';
import { Tabs as UITabs } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import useGetQueryParam from 'src/hooks/use-query-param';
import styled, { css } from 'styled-components';
import DataCollection from './components/data-collection';
import Passkeys from './components/passkeys';
import Rules from './components/rules';
import VerificationChecks from './components/verification-checks';

export type TabsProps = {
  playbook: OnboardingConfig;
  isTabsDisabled: boolean;
  toggleDisableHeading: (disable: boolean) => void;
};

type OptionsProps = { label: string; value: PlaybookTabs }[];

const Tabs = ({ playbook, isTabsDisabled, toggleDisableHeading }: TabsProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'details' });
  const { tab } = useGetQueryParam(tabsRouterSchema);
  const router = useRouter();

  const options: OptionsProps = [
    { value: 'data', label: t('tabs.data-collection') },
    { value: 'verification-checks', label: t('tabs.verification-checks') },
    { value: 'passkeys', label: t('tabs.passkeys') },
    ...(playbook.kind !== OnboardingConfigKind.auth
      ? ([{ value: 'rules', label: t('tabs.rules') }] as OptionsProps)
      : []),
  ];

  const handleChange = (tab: PlaybookTabs) => {
    router.replace({
      query: { ...router.query, tab },
    });
  };

  return (
    <Container>
      <UITabs options={options} onChange={handleChange} disabled={isTabsDisabled} defaultValue={tab} />
      {tab === 'data' && <DataCollection playbook={playbook} />}
      {tab === 'verification-checks' && <VerificationChecks playbook={playbook} />}
      {tab === 'passkeys' && <Passkeys playbook={playbook} />}
      {tab === 'rules' && <Rules playbook={playbook} toggleDisableHeading={toggleDisableHeading} />}
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

export default Tabs;
