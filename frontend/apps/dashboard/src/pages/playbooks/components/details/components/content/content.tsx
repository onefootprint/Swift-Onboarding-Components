import type { OnboardingConfig } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import React from 'react';

import Basics from './components/basics';
import CollectionAndScopes from './components/collection-and-scopes';

type ContentProps = {
  playbook: OnboardingConfig;
};

const Content = ({ playbook }: ContentProps) => (
  <Stack direction="column" gap={9}>
    <Basics playbook={playbook} />
    <CollectionAndScopes playbook={playbook} />
  </Stack>
);

export default Content;
