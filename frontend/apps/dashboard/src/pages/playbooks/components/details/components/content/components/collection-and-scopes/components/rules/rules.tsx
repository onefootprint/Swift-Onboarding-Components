import { type OnboardingConfig } from '@onefootprint/types';
import React from 'react';

import Content from './components/content';
import Error from './components/error';
import Loading from './components/loading';
import useRules from './hooks/use-rules';

export type RulesProps = {
  playbook: OnboardingConfig;
};

const Rules = ({ playbook: { id, kind } }: RulesProps) => {
  const { response, isLoading, error } = useRules(id);

  return (
    <>
      {response && (
        <Content
          hasRules={response.hasRules}
          playbookKind={kind}
          playbookId={id}
          actionRules={response.data}
        />
      )}
      {isLoading && <Loading />}
      {error && <Error error={error} />}
    </>
  );
};

export default Rules;
