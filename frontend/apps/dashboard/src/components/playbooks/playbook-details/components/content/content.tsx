import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { useState } from 'react';
import PlaybookConfig from '../../../playbook-config';
import Breadcrumb from './components/breadcrumb';
import Header from './components/header';

type ContentProps = {
  playbook: OnboardingConfiguration;
  playbooks: OnboardingConfiguration[];
};

const Content = ({ playbook, playbooks }: ContentProps) => {
  const [isHeadingDisabled, setIsHeadingDisabled] = useState(false);

  return (
    <section data-testid="playbook-details-content">
      <div className="mb-6">
        <Breadcrumb playbookName={playbook.name} isDisabled={isHeadingDisabled} />
      </div>
      <div className="mb-6">
        <Header playbook={playbook} playbooks={playbooks} isDisabled={isHeadingDisabled} />
      </div>
      <PlaybookConfig
        playbook={playbook}
        isTabsDisabled={isHeadingDisabled}
        toggleDisableHeading={setIsHeadingDisabled}
      />
    </section>
  );
};
export default Content;
