import type { Rule, RuleAction } from '@onefootprint/types';

import Content from './components/content';
import ErrorComponent from './components/error';
import Loading from './components/loading';

export type RuleSetResultsProps = {
  data?: Record<string, boolean | string | Record<RuleAction, Record<string, boolean | Rule[]>> | null>;
  isLoading: boolean;
  errorMessage?: string;
};

const RuleSetResults = ({ data, isLoading, errorMessage }: RuleSetResultsProps) => (
  <>
    {data && (
      <Content
        ruleResults={data.ruleResults as Record<RuleAction, Record<string, Rule[]>>}
        actionTriggered={data.actionTriggered as RuleAction}
      />
    )}
    {isLoading && <Loading />}
    {errorMessage && <ErrorComponent errorMessage={errorMessage} />}
  </>
);

export default RuleSetResults;
