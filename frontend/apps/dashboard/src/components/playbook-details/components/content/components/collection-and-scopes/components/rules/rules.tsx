import { type OnboardingConfig } from '@onefootprint/types';
import React from 'react';
import useSession from 'src/hooks/use-session';

import Content from './components/content';
import Error from './components/error';
import Loading from './components/loading';
import useRules from './hooks/use-rules';

export type RulesProps = {
  playbook: OnboardingConfig;
  toggleDisableHeading: (disable: boolean) => void;
};

const Rules = ({ playbook, toggleDisableHeading }: RulesProps) => {
  const { response, isLoading, error } = useRules(playbook.id);
  const isFirmEmployee = !!useSession().data.user?.isFirmEmployee;

  return (
    <>
      {response && (
        <Content
          hasRules={response.hasRules}
          playbook={playbook}
          shouldAllowEditing={playbook.isRulesEnabled || isFirmEmployee}
          actionRules={response.data}
          toggleDisableHeading={toggleDisableHeading}
        />
      )}
      {isLoading && <Loading />}
      {error && <Error error={error} />}
    </>
  );
};

export default Rules;
