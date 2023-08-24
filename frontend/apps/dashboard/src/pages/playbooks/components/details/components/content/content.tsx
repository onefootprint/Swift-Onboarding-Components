import { OnboardingConfig } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';

import Basics from './components/basics';
import CollectionAndScopes from './components/collection-and-scopes';

type ContentProps = {
  playbook: OnboardingConfig;
};

const Content = ({ playbook }: ContentProps) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
    <Basics playbook={playbook} />
    <CollectionAndScopes playbook={playbook} />
  </Box>
);

export default Content;
