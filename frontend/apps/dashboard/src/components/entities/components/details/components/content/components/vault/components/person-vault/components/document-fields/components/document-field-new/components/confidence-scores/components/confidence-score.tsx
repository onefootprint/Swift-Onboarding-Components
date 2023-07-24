import { UIStates } from '@onefootprint/design-tokens';
import styled from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React, { Fragment } from 'react';

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
      <Typography variant="body-4" color="tertiary">
        {label}
      </Typography>
      <Score>
        <Typography color={textColor} variant="heading-1">
          {score}/
        </Typography>
        <Typography color={textColor} variant="heading-3">
          100
        </Typography>
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
