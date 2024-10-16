import type { SentilinkReasonCode } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';

type ReasonCodeProps = {
  reasonCode: SentilinkReasonCode;
};

export const ReasonCode = ({ reasonCode }: ReasonCodeProps) => {
  return (
    <Stack direction="column" gap={2} justifyContent="flex-start">
      <Text variant="snippet-2" overflow="hidden" textOverflow="break" whiteSpace="normal">
        {reasonCode.code}
      </Text>
      <Text variant="body-3" color="tertiary" overflowWrap="break-word" whiteSpace="normal">
        {reasonCode.explanation}
      </Text>
    </Stack>
  );
};

export default ReasonCode;
