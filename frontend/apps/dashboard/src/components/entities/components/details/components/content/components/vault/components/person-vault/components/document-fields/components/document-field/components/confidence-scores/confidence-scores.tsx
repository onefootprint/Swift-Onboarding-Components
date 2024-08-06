import { IcoSpeedometer24 } from '@onefootprint/icons';
import type { Document } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import ConfidenceScore from './components/confidence-score';

type ConfidenceScoresProps = {
  document: Document;
};

const ConfidenceScores = ({ document }: ConfidenceScoresProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.fieldset.document.drawer.confidence-scores',
  });

  const confidenceScores = [document?.documentScore, document?.ocrConfidenceScore, document?.selfieScore];

  const numScores = confidenceScores.filter(score => score || score === 0).length;

  if (numScores === 0) {
    return null;
  }

  const confidenceScoreLabels = [t('labels.document'), t('labels.extracted-data'), t('labels.face-match')];

  return (
    <Section>
      <LabelContainer>
        <IcoSpeedometer24 />
        <Text variant="label-2">{t('title')}</Text>
      </LabelContainer>
      <ScoresContainer>
        {confidenceScores.map((score, index) =>
          score || score === 0 ? (
            <ScoreContainer index={index} numScores={numScores} key={confidenceScoreLabels[index]}>
              <ConfidenceScore label={confidenceScoreLabels[index]} score={score} />
            </ScoreContainer>
          ) : null,
        )}
      </ScoresContainer>
    </Section>
  );
};

const ScoreContainer = styled.div<{ index: number; numScores: number }>`
  ${({ theme, index, numScores }) => css`
    display: flex;
    gap: ${theme.spacing[2]};
    flex-direction: column;
    justify-content: flex-start;
    align-items: ${numScores > 1 ? 'flex-start' : 'center'};
    border-right: ${index < numScores - 1 ? `${theme.borderWidth[1]} solid ${theme.borderColor.tertiary}` : 'none'};
    width: 100%;
  `};
`;

const ScoresContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: ${theme.spacing[5]} ${theme.spacing[5]};
    gap: ${theme.spacing[6]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    width: 100%;
  `};
`;

const LabelContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[2]};
    flex-direction: row;
    align-items: flex-end;
    justify-content: flex-start;
  `};
`;

const Section = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[5]};
    flex-direction: column;
    align-items: flex-start;
  `};
`;

export default ConfidenceScores;
