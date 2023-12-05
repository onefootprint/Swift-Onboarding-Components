import type { OnboardingConfigKind } from '@onefootprint/types';
import React from 'react';

import Content from './components/content';
import Error from './components/error';
import Loading from './components/loading';
import useRules from './hooks/use-rules';

export type RulesProps = {
  playbookId: string;
  playbookKind: OnboardingConfigKind;
};

const Rules = ({ playbookId, playbookKind }: RulesProps) => {
  const { response, isLoading, error } = useRules(playbookId);

  return (
    <>
      {response && (
        <Content
          hasRules={response.hasRules}
          actionRules={response.data}
          playbookKind={playbookKind}
        />
      )}
      {isLoading && <Loading />}
      {error && <Error error={error} />}
    </>
  );
};

export default Rules;
