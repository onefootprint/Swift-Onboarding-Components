import { useTranslation } from '@onefootprint/hooks';
import { Box, Button, Tab, Tabs, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import AccessControl from './components/access-control';
import CreateRole from './components/create-role';
import InviteTeammates from './components/invite-teammates';
import People from './components/people';

enum TabName {
  people,
  accessControl,
}
const TeamRoles = () => {
  const { t } = useTranslation('pages.settings.team-roles');
  const [tab, setTab] = useState<TabName>(TabName.people);
  const [createRoleVisible, setCreateRoleVisible] = useState(false);
  const [inviteVisible, setInviteVisible] = useState(false);

  const handleSelectPeople = () => {
    setTab(TabName.people);
  };

  const handleSelectAccessControl = () => {
    setTab(TabName.accessControl);
  };

  return (
    <section data-testid="team-roles">
      <Header>
        <Box>
          <Typography variant="label-1" as="h3" sx={{ marginBottom: 2 }}>
            {t('header.title')}
          </Typography>
          <Typography variant="body-3">{t('header.subtitle')}</Typography>
        </Box>
        <ButtonsContainer>
          <Button
            variant="secondary"
            size="small"
            onClick={() => {
              setInviteVisible(true);
            }}
          >
            {t('header.invite-teammates')}
          </Button>
          <Button
            variant="secondary"
            size="small"
            onClick={() => {
              setCreateRoleVisible(true);
            }}
          >
            {t('header.create-role')}
          </Button>
        </ButtonsContainer>
      </Header>
      <Tabs variant="underlined">
        <Tab
          selected={tab === TabName.people}
          as="button"
          onClick={handleSelectPeople}
        >
          {t('tabs.people')}
        </Tab>
        <Tab
          selected={tab === TabName.accessControl}
          as="button"
          onClick={handleSelectAccessControl}
        >
          {t('tabs.access-control')}
        </Tab>
      </Tabs>
      <Content>
        {tab === TabName.people && <People />}
        {tab === TabName.accessControl && <AccessControl />}
      </Content>
      <CreateRole
        open={createRoleVisible}
        onClose={() => {
          setCreateRoleVisible(false);
        }}
      />
      <InviteTeammates
        open={inviteVisible}
        // onClose={() => {
        //   setInviteVisible(false);
        // }}
      />
    </section>
  );
};

const Header = styled.header`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[2]}px;
    justify-content: space-between;
    margin-bottom: ${theme.spacing[7]}px;
  `}
`;

const ButtonsContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[2]}px;
    justify-content: center;
  `}
`;

const Content = styled.div`
  ${({ theme }) => css`
    width: 100%;
    margin-top: ${theme.spacing[5]}px;
  `}
`;

export default TeamRoles;
