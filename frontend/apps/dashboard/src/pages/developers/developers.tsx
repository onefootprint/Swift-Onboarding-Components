import { useQueryState, useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Tab, Tabs } from '@onefootprint/ui';
import Head from 'next/head';
import React from 'react';

import ApiKeys from './components/api-keys';
import Header from './components/header';
import ProxyConfigs from './components/proxy-configs';
import Webhooks from './components/webhooks';

enum TabName {
  apiKeys = 'api_keys',
  proxyConfigs = 'proxy_configs',
  webhooks = 'webhook',
}

const Developers = () => {
  const { t } = useTranslation('pages.developers');

  const [tab, setTab] = useQueryState<TabName>({
    query: 'tab',
    defaultValue: TabName.apiKeys,
  });
  const tabs = [
    { label: t('tabs.api-keys'), value: TabName.apiKeys },
    { label: t('tabs.proxy-configs'), value: TabName.proxyConfigs },
    { label: t('tabs.webhooks'), value: TabName.webhooks },
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
        {tab === TabName.proxyConfigs && <ProxyConfigs />}
        {tab === TabName.webhooks && <Webhooks />}
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
