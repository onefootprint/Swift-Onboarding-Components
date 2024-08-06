import { useQueryState } from '@onefootprint/hooks';
import { Tabs } from '@onefootprint/ui';
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
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.settings.team-roles',
  });
  const orgQuery = useOrg();
  const [tab, setTab] = useQueryState<string>({
    query: 'tab',
    defaultValue: TabName.members,
  });
  const tabs = [
    { label: t('tabs.members'), value: TabName.members },
    { label: t('tabs.roles'), value: TabName.roles },
    ...(orgQuery.data?.domains.length ? [{ label: t('tabs.access'), value: TabName.domainAccess }] : []),
  ];

  const handleTabChange = (value: string) => {
    setTab(value as TabName);
  };

  return (
    <section data-testid="team-roles-section">
      <SectionHeader title={t('header.title')} subtitle={t('header.subtitle')}>
        <div id="team-roles-actions" />
      </SectionHeader>
      <Tabs options={tabs} onChange={handleTabChange} />
      <Content>
        {tab === TabName.members && <Members />}
        {tab === TabName.roles && <Roles />}
        {tab === TabName.domainAccess && orgQuery.data && <DomainAccess org={orgQuery.data} />}
      </Content>
    </section>
  );
};

const Content = styled.div`
  ${({ theme }) => css`
    width: 100%;
    margin-top: ${theme.spacing[5]};
  `}
`;

export default TeamRoles;
