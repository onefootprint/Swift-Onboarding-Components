import type { OnboardingConfig } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import { useState } from 'react';

import { OnboardingConfigKind } from '@onefootprint/types';
import AuthOnly from './components/auth-only';
import Breadcrumb from './components/breadcrumb';
import Header from './components/header';
import Tabs from './components/tabs';

type ContentProps = {
  playbook: OnboardingConfig;
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
      {kind === OnboardingConfigKind.auth ? (
        <AuthOnly playbook={playbook} />
      ) : (
        <Tabs playbook={playbook} isTabsDisabled={isHeadingDisabled} toggleDisableHeading={setIsHeadingDisabled} />
      )}
    </Box>
  );
};
export default Content;
