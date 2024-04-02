import type { OnboardingConfig } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';

import { Breadcrumb, CollectionAndScopes, Header } from './components';

type ContentProps = {
  playbook: OnboardingConfig;
};

const Content = ({ playbook }: ContentProps) => (
  <Box tag="section" testID="playbook-details-content">
    <Box marginBottom={7}>
      <Breadcrumb playbookName={playbook.name} />
    </Box>
    <Box marginBottom={7}>
      <Header playbook={playbook} />
    </Box>
    <CollectionAndScopes playbook={playbook} />
  </Box>
);
export default Content;
