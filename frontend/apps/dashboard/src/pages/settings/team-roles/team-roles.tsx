import { getOrgOptions } from '@onefootprint/axios/dashboard';
import { Tabs } from '@onefootprint/ui';
import { useQuery } from '@tanstack/react-query';
import Head from 'next/head';
import { parseAsString, useQueryState } from 'nuqs';
import { useTranslation } from 'react-i18next';
import DomainAccess from 'src/components/domain-access';
import SectionHeader from 'src/components/section-header';

import Members from './components/members';
import Roles from './components/roles';

enum TabName {
  members = 'members',
  roles = 'roles',
  domainAccess = 'domain-access',
}

const TeamRoles = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'pages.team-roles' });
  const orgQuery = useQuery(getOrgOptions());
  const [tab, setTab] = useQueryState('tab', parseAsString.withDefault(TabName.members));
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
      <div className="flex flex-col gap-6">
        <h2 className="text-heading-2">{t('meta-title')}</h2>
        <section data-testid="team-roles-section">
          <SectionHeader title={t('header.title')} subtitle={t('header.subtitle')}>
            <div id="team-roles-actions" />
          </SectionHeader>
          <Tabs options={tabs} onChange={setTab} />
          <div className="w-full mt-4">
            {tab === TabName.members && <Members />}
            {tab === TabName.roles && <Roles />}
            {tab === TabName.domainAccess && orgQuery.data && <DomainAccess org={orgQuery.data} />}
          </div>
        </section>
      </div>
    </>
  );
};

export default TeamRoles;
