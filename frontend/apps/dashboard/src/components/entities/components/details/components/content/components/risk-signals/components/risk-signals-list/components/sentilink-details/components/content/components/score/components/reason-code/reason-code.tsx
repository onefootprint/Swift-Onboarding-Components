import type { SentilinkReasonCode } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import RiskIndicator from './components/risk-indicator';

type ReasonCodeProps = {
  reasonCode: SentilinkReasonCode;
};

export const ReasonCode = ({ reasonCode }: ReasonCodeProps) => {
  return (
    <Stack justifyContent="space-between" alignItems="flex-start">
      <Stack direction="column" gap={2} maxWidth="300px">
        <Text variant="snippet-1" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
          {reasonCode.code}
        </Text>
        <Text variant="body-3" color="tertiary" overflowWrap="break-word" whiteSpace="normal">
          {reasonCode.explanation}
        </Text>
      </Stack>
      <RiskIndicator fraudLevel={reasonCode.direction} />
    </Stack>
  );
};

export default ReasonCode;
