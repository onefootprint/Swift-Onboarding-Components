import type { Rule, RuleAction } from '@onefootprint/types';
import React from 'react';

import Content from './components/content';
import Error from './components/error';
import Loading from './components/loading';

export type RulesProps = {
  data?: Record<
    string,
    | boolean
    | string
    | Record<RuleAction, Record<string, boolean | Rule[]>>
    | null
  >;
  isLoading: boolean;
  errorMessage?: string;
};

const Rules = ({ data, isLoading, errorMessage }: RulesProps) => (
  <>
    {data && (
      <Content
        obConfigurationId={data.obConfigurationId as string}
        ruleResults={
          data.ruleResults as Record<RuleAction, Record<string, Rule[]>>
        }
        actionTriggered={data.actionTriggered as RuleAction}
      />
    )}
    {isLoading && <Loading />}
    {errorMessage && <Error errorMessage={errorMessage} />}
  </>
);

export default Rules;
