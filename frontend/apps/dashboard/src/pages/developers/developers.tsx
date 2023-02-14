import { useQueryState, useTranslation } from '@onefootprint/hooks';
import { Tab, Tabs } from '@onefootprint/ui';
import Head from 'next/head';
import React from 'react';
import styled, { css } from 'styled-components';

import ApiKeys from './components/api-keys';
import Header from './components/header';
import OnboardingConfigs from './components/onboarding-configs';

enum TabName {
  apiKeys = 'api_keys',
  onboardingConfigs = 'onboarding_configs',
}

const Developers = () => {
  const { t } = useTranslation('pages.developers');
  const [tab, setTab] = useQueryState<TabName>({
    query: 'tab',
    defaultValue: TabName.apiKeys,
  });
  const tabs = [
    { label: t('tabs.api-keys'), value: TabName.apiKeys },
    { label: t('tabs.onboarding-configs'), value: TabName.onboardingConfigs },
  ];

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Header />
      <Tabs variant="underlined">
        {tabs.map(({ value, label }) => (
          <Tab
            as="button"
            key={value}
            onClick={() => setTab(value)}
            selected={tab === value}
          >
            {label}
          </Tab>
        ))}
      </Tabs>
      <Content>
        {tab === TabName.apiKeys && <ApiKeys />}
        {tab === TabName.onboardingConfigs && <OnboardingConfigs />}
      </Content>
    </>
  );
};

const Content = styled.div`
  ${({ theme }) => css`
    width: 100%;
    margin-top: ${theme.spacing[9]};
  `}
`;

export default Developers;
