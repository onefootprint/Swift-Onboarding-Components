import type { Rule } from '@onefootprint/types';
import { RuleAction } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import React from 'react';

import ActionResultSection from './components/action-result-section';

export type ContentProps = {
  obConfigurationId: string;
  ruleResults: Record<RuleAction, Record<string, boolean | Rule[]>>;
};

const Content = ({ obConfigurationId, ruleResults }: ContentProps) => (
  <Stack direction="column" gap={8}>
    {Object.values(RuleAction).map(action => (
      <ActionResultSection
        key={action}
        obConfigurationId={obConfigurationId}
        action={action}
        data={ruleResults[action]}
      />
    ))}
  </Stack>
);

export default Content;
