import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { Box } from '@onefootprint/ui';
import { useState } from 'react';
import PlaybookConfig from '../../../playbook-config';
import Breadcrumb from './components/breadcrumb';
import Header from './components/header';

type ContentProps = {
  playbook: OnboardingConfiguration;
};

const Content = ({ playbook }: ContentProps) => {
  const [isHeadingDisabled, setIsHeadingDisabled] = useState(false);

  return (
    <Box tag="section" testID="playbook-details-content">
      <Box marginBottom={7}>
        <Breadcrumb playbookName={playbook.name} isDisabled={isHeadingDisabled} />
      </Box>
      <Box marginBottom={7}>
        <Header playbook={playbook} isDisabled={isHeadingDisabled} />
      </Box>
      <PlaybookConfig
        playbook={playbook}
        isTabsDisabled={isHeadingDisabled}
        toggleDisableHeading={setIsHeadingDisabled}
      />
    </Box>
  );
};
export default Content;
