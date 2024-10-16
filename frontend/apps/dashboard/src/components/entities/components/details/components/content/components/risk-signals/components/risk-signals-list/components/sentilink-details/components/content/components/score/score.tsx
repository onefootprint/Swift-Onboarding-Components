import type { SentilinkReasonCode } from '@onefootprint/types';
import { SentilinkFraudLevel } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import ReasonCode from './components/reason-code';
import RiskIndicator from './components/risk-indicator';
import { getLessFraudyReasonCodes, getMoreFraudyReasonCodes } from './utils/sort-reason-codes';

type ScoreProps = {
  score: number;
  reasonCodes: SentilinkReasonCode[];
  title: string;
};

const Score = ({ score, reasonCodes, title }: ScoreProps) => {
  const moreFraudyReasonCodes = getMoreFraudyReasonCodes(reasonCodes);
  const lessFraudyReasonCodes = getLessFraudyReasonCodes(reasonCodes);

  return (
    <Stack direction="column" borderColor="tertiary" borderWidth={1} borderRadius="default" borderStyle="solid">
      <Stack
        direction="column"
        paddingInline={5}
        paddingBlock={4}
        borderBottomWidth={1}
        borderColor="tertiary"
        borderStyle="solid"
      >
        <Text variant="label-1" color="secondary">
          {title}
        </Text>
        <Text variant="heading-1" color={score >= 500 ? 'error' : 'success'}>
          {score}
        </Text>
      </Stack>
      <Stack direction="column" padding={5} gap={5}>
        {moreFraudyReasonCodes.length > 0 && (
          <Stack direction="column" gap={4}>
            <RiskIndicator fraudLevel={SentilinkFraudLevel.moreFraudy} />
            <Stack direction="column" gap={5}>
              {moreFraudyReasonCodes.map(reasonCode => (
                <ReasonCode key={reasonCode.code} reasonCode={reasonCode} />
              ))}
            </Stack>
          </Stack>
        )}
        {lessFraudyReasonCodes.length > 0 && (
          <Stack direction="column" gap={4}>
            <RiskIndicator fraudLevel={SentilinkFraudLevel.lessFraudy} />
            <Stack direction="column" gap={5}>
              {lessFraudyReasonCodes.map(reasonCode => (
                <ReasonCode key={reasonCode.code} reasonCode={reasonCode} />
              ))}
            </Stack>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};

export default Score;
