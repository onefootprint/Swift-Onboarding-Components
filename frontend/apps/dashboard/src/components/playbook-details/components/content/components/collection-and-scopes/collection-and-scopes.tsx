import { type OnboardingConfig, OnboardingConfigKind } from '@onefootprint/types';
import { Tabs } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import AmlMonitoring from './components/aml-monitoring';
import AuthorizedScopes from './components/authorized-scopes';
import DataCollection from './components/data-collection';
import Rules from './components/rules';

export type CollectionAndScopesProps = {
  playbook: OnboardingConfig;
  isTabsDisabled: boolean;
  toggleDisableHeading: (disable: boolean) => void;
};

const CollectionAndScopes = ({ playbook, isTabsDisabled, toggleDisableHeading }: CollectionAndScopesProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.details',
  });
  const options = [
    { value: 'data', label: t('tabs.data-collection') },
    { value: 'authorized-scopes', label: t('tabs.authorized-scopes') },
    { value: 'aml-monitoring', label: t('tabs.aml-monitoring') },
    ...(playbook.kind !== OnboardingConfigKind.auth ? [{ value: 'rules', label: t('tabs.rules') }] : []),
  ];
  const [tab, setTab] = useState(options[0].value);

  const handleChange = (value: string) => {
    setTab(value);
  };

  return (
    <Container>
      <Tabs options={options} onChange={handleChange} disabled={isTabsDisabled} />
      {tab === 'data' && <DataCollection playbook={playbook} />}
      {tab === 'authorized-scopes' && <AuthorizedScopes playbook={playbook} />}
      {tab === 'aml-monitoring' && <AmlMonitoring playbook={playbook} />}
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

export default CollectionAndScopes;
