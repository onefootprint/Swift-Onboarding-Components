import { Container, Stack, createFontStyles, media } from '@onefootprint/ui';
import { Box } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import Card from './components/card';
import BestInClass from './illustrations/best-in-class';
import FlexibleAndCustomizable from './illustrations/flexible-and-customizable';
import FraudPreventionScores from './illustrations/fraud-prevention-scores';
import GlobalSupport from './illustrations/global-support';

const cards = [
  {
    key: 'best-in-class',
    illustration: <BestInClass />,
  },
  {
    key: 'flexible-and-customizable',
    illustration: <FlexibleAndCustomizable />,
  },
  {
    key: 'fraud-prevention',
    illustration: <FraudPreventionScores />,
  },
  {
    key: 'global-support',
    illustration: <GlobalSupport />,
    faded: true,
  },
];

const GridCards = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.doc-scan.grid-cards' });
  const isInverted = (key: string) => key === 'best-in-class' || key === 'flexible-and-customizable';
  return (
    <Container align="center" justify="center" gap={10} paddingTop={11} paddingBottom={11} maxWidth="1100px">
      <Stack direction="column" gap={5} textAlign="center" maxWidth="720px" justify="center" align="center">
        <Title tag="h2">{t('title')}</Title>
        <Subtitle tag="h3">{t('subtitle')}</Subtitle>
      </Stack>
      <CardsContainer>
        {cards.map(card => (
          <CardWrapper area={card.key} key={card.key}>
            <Card
              translationKey={card.key}
              illustration={card.illustration}
              $inverted={isInverted(card.key)}
              $faded={card.faded}
            />
          </CardWrapper>
        ))}
      </CardsContainer>
    </Container>
  );
};

const Title = styled(Box)`
  ${createFontStyles('display-2')}
`;

const Subtitle = styled(Box)`
  ${createFontStyles('display-4')}
`;

const CardsContainer = styled(Box)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};

    && {
      max-width: 1100px;
    }
    ${media.greaterThan('md')`
      gap: ${theme.spacing[5]};
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(12, 1fr);
      max-height: 1200px;
      grid-template-areas:
        "best-in-class fraud-prevention"
        "best-in-class fraud-prevention"
        "best-in-class fraud-prevention"
        "best-in-class fraud-prevention"
        "best-in-class fraud-prevention"
        "best-in-class fraud-prevention"
        "best-in-class global-support"
        "flexible-and-customizable global-support"
        "flexible-and-customizable global-support"
        "flexible-and-customizable global-support"
        "flexible-and-customizable global-support"
          "flexible-and-customizable global-support";
    `}
  `}
`;

const CardWrapper = styled.div<{ area: string }>`
  ${({ area }) => css`
    grid-area: ${area};
  `}
`;

export default GridCards;
