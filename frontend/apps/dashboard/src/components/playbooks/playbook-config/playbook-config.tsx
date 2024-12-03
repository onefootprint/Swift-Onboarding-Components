import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import noop from 'lodash/noop';
import AuthOnly from './components/auth-only';
import Tabs from './components/tabs';

type PlaybookConfigProps = {
  playbook: OnboardingConfiguration;
  isTabsDisabled?: boolean;
  toggleDisableHeading?: (disable: boolean) => void;
  options?: {
    hideSettings?: boolean;
  };
};

const PlaybookConfig = ({
  playbook,
  isTabsDisabled = false,
  toggleDisableHeading = noop,
  options = {
    hideSettings: false,
  },
}: PlaybookConfigProps) => {
  return (
    <>
      {playbook.kind === 'auth' ? (
        <AuthOnly playbook={playbook} />
      ) : (
        <Tabs
          playbook={playbook}
          isTabsDisabled={isTabsDisabled}
          toggleDisableHeading={toggleDisableHeading}
          hideSettings={options.hideSettings || false}
        />
      )}
    </>
  );
};

export default PlaybookConfig;
