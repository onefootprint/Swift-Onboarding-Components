import type { UIStates } from '@onefootprint/design-tokens';
import { Text } from '@onefootprint/ui';
import styled from 'styled-components';

type ConfidenceScoreProps = {
  score: number;
  label: string;
};

const LOW_SCORE_UPPER_BOUND = 50;
const MEDIUM_SCORE_UPPER_BOUND = 84;

const ConfidenceScore = ({ score, label }: ConfidenceScoreProps) => {
  let textColor: keyof UIStates = 'error';
  if (score >= LOW_SCORE_UPPER_BOUND && score <= MEDIUM_SCORE_UPPER_BOUND) {
    textColor = 'warning';
  } else if (score > MEDIUM_SCORE_UPPER_BOUND) {
    textColor = 'success';
  }
  return (
    <>
      <Text variant="body-3" color="tertiary">
        {label}
      </Text>
      <Score>
        <Text color={textColor} variant="heading-1">
          {score}/
        </Text>
        <Text color={textColor} variant="heading-3">
          100
        </Text>
      </Score>
    </>
  );
};

const Score = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-end;
`;

export default ConfidenceScore;
