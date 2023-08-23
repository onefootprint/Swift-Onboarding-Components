import { OnboardingConfig } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';

type ContentProps = {
  playbook: OnboardingConfig;
};

const Content = ({ playbook }: ContentProps) => (
  <Box testID="playbooks-details-content">
    {/* placeholder */}
    {playbook.name}
  </Box>
);

export default Content;
