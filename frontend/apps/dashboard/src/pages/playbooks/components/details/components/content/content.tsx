import { OnboardingConfig } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';

import Basics from './components/basics';

type ContentProps = {
  playbook: OnboardingConfig;
};

const Content = ({ playbook }: ContentProps) => (
  <Box testID="playbooks-details-content">
    <Basics playbook={playbook} />
  </Box>
);

export default Content;
