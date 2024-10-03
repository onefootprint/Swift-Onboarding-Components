import { useQueryState } from '@onefootprint/hooks';
import { Stack, Tabs, Text } from '@onefootprint/ui';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import DomainAccess from 'src/components/domain-access';
import SectionHeader from 'src/components/section-header';
import useOrg from 'src/hooks/use-org';
import styled, { css } from 'styled-components';

import Members from './components/members';
import Roles from './components/roles';

enum TabName {
  members = 'members',
  roles = 'roles',
  domainAccess = 'domain-access',
}

const TeamRoles = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'pages.team-roles' });
  const orgQuery = useOrg();
  const [tab, setTab] = useQueryState<TabName>({ query: 'tab', defaultValue: TabName.members });
  const tabs = [
    { label: t('tabs.members'), value: TabName.members },
    { label: t('tabs.roles'), value: TabName.roles },
    ...(orgQuery.data?.domains.length ? [{ label: t('tabs.access'), value: TabName.domainAccess }] : []),
  ];

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Stack direction="column" gap={7}>
        <Text variant="heading-2">{t('meta-title')}</Text>
        <section data-testid="team-roles-section">
          <SectionHeader title={t('header.title')} subtitle={t('header.subtitle')}>
            <div id="team-roles-actions" />
          </SectionHeader>
          <Tabs options={tabs} onChange={setTab} />
          <Content>
            {tab === TabName.members && <Members />}
            {tab === TabName.roles && <Roles />}
            {tab === TabName.domainAccess && orgQuery.data && <DomainAccess org={orgQuery.data} />}
          </Content>
        </section>
      </Stack>
    </>
  );
};

const Content = styled.div`
  ${({ theme }) => css`
    width: 100%;
    margin-top: ${theme.spacing[5]};
  `}
`;

export default TeamRoles;
