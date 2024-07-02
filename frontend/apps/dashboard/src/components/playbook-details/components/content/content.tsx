import type { OnboardingConfig } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React, { useState } from 'react';

import Breadcrumd from './components/breadcrumb';
import Header from './components/header';
import Tabs from './components/tabs';

type ContentProps = {
  playbook: OnboardingConfig;
};

const Content = ({ playbook }: ContentProps) => {
  const [isHeadingDisabled, setIsHeadingDisabled] = useState(false);

  return (
    <Box tag="section" testID="playbook-details-content">
      <Box marginBottom={7}>
        <Breadcrumd playbookName={playbook.name} isDisabled={isHeadingDisabled} />
      </Box>
      <Box marginBottom={7}>
        <Header playbook={playbook} isDisabled={isHeadingDisabled} />
      </Box>
      <Tabs playbook={playbook} isTabsDisabled={isHeadingDisabled} toggleDisableHeading={setIsHeadingDisabled} />
    </Box>
  );
};
export default Content;
