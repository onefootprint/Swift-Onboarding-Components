import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { Box } from '@onefootprint/ui';
import { useState } from 'react';

import AuthOnly from './components/auth-only';
import Breadcrumb from './components/breadcrumb';
import Header from './components/header';
import Tabs from './components/tabs';

type ContentProps = {
  playbook: OnboardingConfiguration;
};

const Content = ({ playbook }: ContentProps) => {
  const [isHeadingDisabled, setIsHeadingDisabled] = useState(false);
  const { kind } = playbook;

  return (
    <Box tag="section" testID="playbook-details-content">
      <Box marginBottom={7}>
        <Breadcrumb playbookName={playbook.name} isDisabled={isHeadingDisabled} />
      </Box>
      <Box marginBottom={7}>
        <Header playbook={playbook} isDisabled={isHeadingDisabled} />
      </Box>
      {kind === 'auth' ? (
        <AuthOnly playbook={playbook} />
      ) : (
        <Tabs playbook={playbook} isTabsDisabled={isHeadingDisabled} toggleDisableHeading={setIsHeadingDisabled} />
      )}
    </Box>
  );
};
export default Content;
