import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { useState } from 'react';

import AuthOnly from './components/auth-only';
import Tabs from './components/tabs';

type PlaybookConfigProps = {
  playbook: OnboardingConfiguration;
  isTabsDisabled: boolean;
  toggleDisableHeading: (disable: boolean) => void;
};

const PlaybookConfig = ({ playbook }: PlaybookConfigProps) => {
  const [isHeadingDisabled, setIsHeadingDisabled] = useState(false);

  return (
    <>
      {playbook.kind === 'auth' ? (
        <AuthOnly playbook={playbook} />
      ) : (
        <Tabs playbook={playbook} isTabsDisabled={isHeadingDisabled} toggleDisableHeading={setIsHeadingDisabled} />
      )}
    </>
  );
};
export default PlaybookConfig;
