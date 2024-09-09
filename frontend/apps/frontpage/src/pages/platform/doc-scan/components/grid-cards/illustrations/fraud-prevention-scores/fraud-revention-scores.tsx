import { IcoSpeedometer24 } from '@onefootprint/icons';
import { Stack, Text, media } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import styled, { css } from 'styled-components';

const scoresContent = [
  {
    title: 'Document',
    score: 97,
  },
  {
    title: 'Extracted data',
    score: 95,
  },
  {
    title: 'Face match',
    score: 98,
  },
];

const MAIN_CARD_WIDTH = 500;
const MAIN_CARD_HEIGHT = 180;

const FraudPreventionScores = () => {
  return (
    <Container>
      <Wrapper>
        <ScoreCard>
          <Title>
            <IcoSpeedometer24 />
            <Text variant="label-2">Scores</Text>
          </Title>
          <Scores>
            {scoresContent.map((score, index) => (
              <Score key={score.title} $isLast={index === scoresContent.length - 1}>
                <Text variant="body-3" whiteSpace="nowrap">
                  {score.title}
                </Text>
                <ScoreNumber>
                  <Text variant="heading-1">{score.score}/</Text>
                  <Text variant="heading-3">100</Text>
                </ScoreNumber>
              </Score>
            ))}
          </Scores>
        </ScoreCard>
        <PerspectiveCard data-order={1} />
        <PerspectiveCard data-order={2} />
      </Wrapper>
    </Container>
  );
};

const Wrapper = styled(motion.div)`
  position: absolute;
  width: ${MAIN_CARD_WIDTH}px;
  height: ${MAIN_CARD_HEIGHT}px;
  transform: translate(-50%, -50%) scale(0.65);
  top: 50%;
  left: 50%;

  ${media.greaterThan('md')`
    transform: translate(-50%, -50%) scale(1);
  `}
`;

const PerspectiveCard = styled.div`
  ${({ theme }) => css`
    position: absolute;
    background-color: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    background-color: ${theme.backgroundColor.secondary};

    &[data-order='1'] {
      top: calc(50% + 30px);
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;
      width: ${MAIN_CARD_WIDTH - 32}px;
      height: ${MAIN_CARD_HEIGHT - 40}px;
    }

    &[data-order='2'] {
      z-index: 0;
      width: ${MAIN_CARD_WIDTH - 56}px;
      height: ${MAIN_CARD_HEIGHT - 40}px;
      top: calc(50% + 40px);
      left: 50%;
      transform: translate(-50%, -50%);
    }
  `}
`;

const Container = styled(Stack)`
  align-items: center;
  justify-content: center;
  overflow: hidden;
  width: 100%;
  height: 100%;
  min-height: 220px;
  position: relative;
  isolation: isolate;

  ${media.greaterThan('md')`
    min-height: 320px;
  `}
`;

const ScoreCard = styled(motion(Stack))`
  ${({ theme }) => css`
    align-items: flex-start;
    justify-content: flex-start;
    overflow: hidden;
    background-color: ${theme.backgroundColor.primary};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    flex-direction: column;
    padding: ${theme.spacing[5]} ${theme.spacing[7]};
    gap: ${theme.spacing[6]};
    border-radius: ${theme.borderRadius.default};
    z-index: 3;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: ${MAIN_CARD_WIDTH}px;
    height: ${MAIN_CARD_HEIGHT}px;
  `}
`;

const Title = styled(Stack)`
  ${({ theme }) => css`
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[3]};
  `}
`;

const Scores = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[6]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    padding: ${theme.spacing[6]} ${theme.spacing[7]};
    border-radius: ${theme.borderRadius.default};
  `}
`;

const Score = styled.div<{ $isLast: boolean }>`
  ${({ theme, $isLast }) => css`
    display: flex;
    flex-direction: column;
    border-right: ${!$isLast ? `${theme.borderWidth[1]} solid ${theme.borderColor.tertiary}` : 'none'};
    padding-right: ${theme.spacing[9]};
  `}
`;

const ScoreNumber = styled(Stack)`
  ${({ theme }) => css`
    align-items: center;
    justify-content: flex-end;
    color: ${theme.color.success};
  `}
`;

export default FraudPreventionScores;
