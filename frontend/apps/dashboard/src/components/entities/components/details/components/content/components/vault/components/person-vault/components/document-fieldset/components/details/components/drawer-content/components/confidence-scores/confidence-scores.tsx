import { IcoSpeedometer24 } from '@onefootprint/icons';
import type { Document } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import CollapsibleSection from '../collapsible-section';
import ConfidenceScore from './components/confidence-score';

type ConfidenceScoresProps = {
  document: Document | Omit<Document, 'uploads'>;
};

const ConfidenceScores = ({ document }: ConfidenceScoresProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'fieldset.document.drawer.confidence-scores',
  });
  const confidenceScoreLabels = [t('labels.document'), t('labels.extracted-data'), t('labels.face-match')];
  const confidenceScores = [document?.documentScore, document?.ocrConfidenceScore, document?.selfieScore];
  const numScores = confidenceScores.filter(score => score || score === 0).length;

  if (numScores === 0) return null;

  return (
    <CollapsibleSection icon={IcoSpeedometer24} title={t('title')} defaultOpen={true}>
      <Stack justify="space-between" gap={6} width="100%">
        {confidenceScores.map((score, index) =>
          score || score === 0 ? (
            <ScoreContainer
              key={confidenceScoreLabels[index]}
              $index={index}
              $numScores={numScores}
              direction="column"
              gap={2}
              justify="flex-start"
              align={numScores > 1 ? 'flex-start' : 'center'}
              width="100%"
            >
              <ConfidenceScore label={confidenceScoreLabels[index]} score={score} />
            </ScoreContainer>
          ) : null,
        )}
      </Stack>
    </CollapsibleSection>
  );
};

const ScoreContainer = styled(Stack)<{ $index: number; $numScores: number }>`
  ${({ theme, $index, $numScores }) => css`
    border-right: ${$index < $numScores - 1 ? `${theme.borderWidth[1]} solid ${theme.borderColor.tertiary}` : 'none'};
  `};
`;

export default ConfidenceScores;
