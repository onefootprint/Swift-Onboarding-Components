import { useQueryState, useTranslation } from '@onefootprint/hooks';
import { Tab, Tabs } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import SectionHeader from '../section-header';
import AccessControl from './components/access-control';
import Members from './components/members';

enum TabName {
  members = 'members',
  accessControl = 'access-control',
}

const TeamRoles = () => {
  const { t } = useTranslation('pages.settings.team-roles');
  const [tab, setTab] = useQueryState<TabName>({
    query: 'tab',
    defaultValue: TabName.members,
  });
  const tabs = [
    { label: t('tabs.members'), value: TabName.members },
    { label: t('tabs.access-control'), value: TabName.accessControl },
  ];

  return (
    <section data-testid="team-roles-section">
      <SectionHeader
        title={t('header.title')}
        subtitle={t('header.subtitle')}
      />
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
        {tab === TabName.members && <Members />}
        {tab === TabName.accessControl && <AccessControl />}
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
