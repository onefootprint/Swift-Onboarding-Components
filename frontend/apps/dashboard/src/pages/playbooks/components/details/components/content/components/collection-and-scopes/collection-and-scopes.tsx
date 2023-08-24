import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { OnboardingConfig } from '@onefootprint/types';
import { Tab, Tabs } from '@onefootprint/ui';
import React, { useState } from 'react';

import {
  basicInformationFields,
  usResidentDisplayFields,
} from '@/playbooks/utils/machine/types';

import DataCollection from './components/data-collection';

export type CollectionAndScopesProps = {
  playbook: OnboardingConfig;
};

const CollectionAndScopes = ({ playbook }: CollectionAndScopesProps) => {
  const { t } = useTranslation('pages.playbooks.table.details.content');
  const options = [
    { value: 'data', label: t('basics.data-collection') },
    { value: 'authorized-scopes', label: t('basics.authorized-scopes') },
  ];
  const [segment, setSegment] = useState(options[0].value);
  const { mustCollectData } = playbook;

  const handleChange = (value: string) => {
    setSegment(value);
  };

  return (
    <Container>
      <Tabs variant="underlined">
        {options.map(({ value, label }) => (
          <Tab
            as="button"
            key={value}
            onClick={() => handleChange(value)}
            selected={segment === value}
          >
            {label}
          </Tab>
        ))}
      </Tabs>

      {segment === 'data' && (
        <>
          <DataCollection
            displayFields={basicInformationFields}
            mustCollectData={mustCollectData}
            title={t('data-collection.basic-information')}
          />
          <DataCollection
            displayFields={usResidentDisplayFields}
            mustCollectData={mustCollectData}
            title={t('data-collection.us-residents')}
          />
        </>
      )}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

export default CollectionAndScopes;
