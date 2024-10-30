import type { UIStates } from '@onefootprint/design-tokens';
import { Stack, Text } from '@onefootprint/ui';

type ConfidenceScoreProps = {
  score: number;
  label: string;
};

const LOW_SCORE_UPPER_BOUND = 50;
const MEDIUM_SCORE_UPPER_BOUND = 84;

const ConfidenceScore = ({ score, label }: ConfidenceScoreProps) => {
  const getTextColor = (score: number): keyof UIStates => {
    if (score > MEDIUM_SCORE_UPPER_BOUND) return 'success';
    if (score >= LOW_SCORE_UPPER_BOUND) return 'warning';
    return 'error';
  };
  const textColor = getTextColor(score);

  return (
    <>
      <Text variant="body-3" color="tertiary">
        {label}
      </Text>
      <Stack direction="row" justify="flex-start" align="flex-end">
        <Text color={textColor} variant="heading-1">
          {score}/
        </Text>
        <Text color={textColor} variant="heading-3">
          100
        </Text>
      </Stack>
    </>
  );
};

export default ConfidenceScore;
