import type { SentilinkReasonCode } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import RiskIndicator from './components/risk-indicator';

type ReasonCodeProps = {
  reasonCode: SentilinkReasonCode;
};

export const ReasonCode = ({ reasonCode }: ReasonCodeProps) => {
  return (
    <Stack justifyContent="space-between" alignItems="flex-start">
      <Stack direction="column" gap={2}>
        <Text variant="snippet-1">{reasonCode.code}</Text>
        <Text variant="body-3" color="tertiary">
          {reasonCode.explanation}
        </Text>
      </Stack>
      <RiskIndicator fraudLevel={reasonCode.direction} />
    </Stack>
  );
};

export default ReasonCode;
