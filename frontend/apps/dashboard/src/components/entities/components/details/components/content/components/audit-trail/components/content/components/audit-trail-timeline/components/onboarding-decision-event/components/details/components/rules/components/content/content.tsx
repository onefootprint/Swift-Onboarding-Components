import type { Rule } from '@onefootprint/types';
import { RuleAction } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import React from 'react';

import ActionResultSection from './components/action-result-section';

export type ContentProps = {
  obConfigurationId: string;
  ruleResults: Partial<Record<RuleAction, Record<string, boolean | Rule[]>>>;
};

const Content = ({ obConfigurationId, ruleResults }: ContentProps) => (
  <Stack direction="column" gap={8}>
    {Object.values(RuleAction)
      .filter(
        action =>
          ![
            RuleAction.stepUpIdentity,
            RuleAction.stepUpPoA,
            RuleAction.stepUpIdentitySsn,
          ].includes(action),
      )
      .map(action => (
        <ActionResultSection
          key={action}
          obConfigurationId={obConfigurationId}
          action={action}
          data={ruleResults[action] as Record<string, boolean | Rule[]>}
        />
      ))}
  </Stack>
);

export default Content;
