import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import {
  type OnboardingConfig,
  OnboardingConfigKind,
} from '@onefootprint/types';
import { Tab, Tabs } from '@onefootprint/ui';
import React, { useState } from 'react';

import AmlMonitoring from './components/aml-monitoring';
import AuthorizedScopes from './components/authorized-scopes';
import DataCollection from './components/data-collection';
import Rules from './components/rules';

export type CollectionAndScopesProps = {
  playbook: OnboardingConfig;
};

const CollectionAndScopes = ({ playbook }: CollectionAndScopesProps) => {
  const { t } = useTranslation('pages.playbooks.details');
  const options = [
    { value: 'data', label: t('tabs.data-collection') },
    { value: 'authorized-scopes', label: t('tabs.authorized-scopes') },
    { value: 'aml-monitoring', label: t('tabs.aml-monitoring') },
    ...(playbook.kind !== OnboardingConfigKind.auth
      ? [{ value: 'rules', label: t('tabs.rules') }]
      : []),
  ];
  const [tab, setTab] = useState(options[0].value);

  const handleChange = (value: string) => {
    setTab(value);
  };

  return (
    <Container>
      <Tabs>
        {options.map(({ value, label }) => (
          <Tab
            key={value}
            onClick={() => handleChange(value)}
            selected={tab === value}
          >
            {label}
          </Tab>
        ))}
      </Tabs>
      {tab === 'data' && <DataCollection playbook={playbook} />}
      {tab === 'authorized-scopes' && <AuthorizedScopes playbook={playbook} />}
      {tab === 'aml-monitoring' && <AmlMonitoring playbook={playbook} />}
      {tab === 'rules' && <Rules playbook={playbook} />}
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
