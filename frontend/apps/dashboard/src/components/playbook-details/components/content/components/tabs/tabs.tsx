import { type OnboardingConfig, OnboardingConfigKind } from '@onefootprint/types';
import { Tabs as UITabs } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import AmlMonitoring from './components/aml-monitoring';
import DataCollection from './components/data-collection';
import Rules from './components/rules';

export type TabsProps = {
  playbook: OnboardingConfig;
  isTabsDisabled: boolean;
  toggleDisableHeading: (disable: boolean) => void;
};

const Tabs = ({ playbook, isTabsDisabled, toggleDisableHeading }: TabsProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'details' });
  const options = [
    { value: 'data', label: t('tabs.data-collection') },
    { value: 'aml-monitoring', label: t('tabs.aml-monitoring') },
    ...(playbook.kind !== OnboardingConfigKind.auth ? [{ value: 'rules', label: t('tabs.rules') }] : []),
  ];
  const [tab, setTab] = useState(options[0].value);

  const handleChange = (value: string) => {
    setTab(value);
  };

  return (
    <Container>
      <UITabs options={options} onChange={handleChange} disabled={isTabsDisabled} />
      {tab === 'data' && <DataCollection playbook={playbook} />}
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

export default Tabs;
