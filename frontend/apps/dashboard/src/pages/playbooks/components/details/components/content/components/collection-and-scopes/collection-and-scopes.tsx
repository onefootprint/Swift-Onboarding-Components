import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import type { OnboardingConfig } from '@onefootprint/types';
import { Tab, Tabs } from '@onefootprint/ui';
import React, { useState } from 'react';

import AmlMonitoring from './components/aml-monitoring';
import AuthorizedScopes from './components/authorized-scopes';
import DataCollection from './components/data-collection';

export type CollectionAndScopesProps = {
  playbook: OnboardingConfig;
};

const CollectionAndScopes = ({
  playbook: {
    allowInternationalResidents,
    allowUsResidents,
    canAccessData,
    enhancedAml,
    internationalCountryRestrictions,
    isDocFirstFlow,
    mustCollectData,
    optionalData,
  },
}: CollectionAndScopesProps) => {
  const { t } = useTranslation('pages.playbooks.details');
  const options = [
    { value: 'data', label: t('tabs.data-collection') },
    { value: 'authorized-scopes', label: t('tabs.authorized-scopes') },
    { value: 'aml-monitoring', label: t('tabs.aml-monitoring') },
  ];
  const [tab, setTab] = useState(options[0].value);

  const handleChange = (value: string) => {
    setTab(value);
  };

  return (
    <Container>
      <Tabs variant="underlined">
        <TabContainer>
          {options.map(({ value, label }) => (
            <Tab
              key={value}
              onClick={() => handleChange(value)}
              selected={tab === value}
            >
              {label}
            </Tab>
          ))}
        </TabContainer>
      </Tabs>
      {tab === 'data' && (
        <DataCollection
          allowInternationalResidents={allowInternationalResidents}
          allowUsResidents={allowUsResidents}
          internationalCountryRestrictions={internationalCountryRestrictions}
          isDocFirstFlow={isDocFirstFlow}
          mustCollectData={mustCollectData}
          optionalData={optionalData}
        />
      )}
      {tab === 'authorized-scopes' && (
        <AuthorizedScopes
          allowInternationalResidents={allowInternationalResidents}
          allowUsResidents={allowUsResidents}
          canAccessData={canAccessData}
        />
      )}
      {tab === 'aml-monitoring' && (
        <AmlMonitoring
          adverseMedia={enhancedAml.adverseMedia}
          enhancedAml={enhancedAml.enhancedAml}
          ofac={enhancedAml.ofac}
          pep={enhancedAml.pep}
        />
      )}
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

const TabContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[8]};
  `}
`;

export default CollectionAndScopes;
