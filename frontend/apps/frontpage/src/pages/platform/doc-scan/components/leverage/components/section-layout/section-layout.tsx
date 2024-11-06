import { Box, Button, Container, media } from '@onefootprint/ui';
import { Stack, Text } from '@onefootprint/ui';
import type React from 'react';
import { addCurrentParamsToUrl } from 'src/utils/dom';
import styled, { css } from 'styled-components';
import FeatureCard, { type FeatureCardProps } from './components/feature-card';

type MainProps = {
  title: string;
  subtitle: string;
  mainCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
};

type SectionLayoutProps = {
  $inverted?: boolean;
  main: MainProps;
  illustration: React.ReactNode;
  featureCards: FeatureCardProps[];
};

export const SectionLayout = ({ main, illustration, featureCards, $inverted }: SectionLayoutProps) => {
  return (
    <StyledContainer>
      <IllustrationContainer $inverted={$inverted}>{illustration}</IllustrationContainer>
      <MainContainer $inverted={$inverted}>
        <Stack direction="column" align="flex-start" justify="flex-start" gap={5}>
          <Text variant="display-3">{main.title}</Text>
          <Text variant="body-1">{main.subtitle}</Text>
          {main.mainCta && (
            <Stack direction="row" align="center" gap={3} marginTop={5}>
              {main.mainCta.href ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    const urlWithParams = addCurrentParamsToUrl(main.mainCta!.href);
                    window.open(urlWithParams, '_blank');
                  }}
                >
                  {main.mainCta.label}
                </Button>
              ) : null}
              {main.secondaryCta?.href ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    const urlWithParams = addCurrentParamsToUrl(main.secondaryCta!.href);
                    window.open(urlWithParams, '_blank');
                  }}
                >
                  {main.secondaryCta.label}
                </Button>
              ) : null}
            </Stack>
          )}
        </Stack>
      </MainContainer>
      <Divider />
      {featureCards.map((featureCard, index) => {
        const gridColumn = index === 0 ? '1 / 3' : index === 1 ? '3 / 5' : '5 / 7';
        return <FeatureCard key={featureCard.title} {...featureCard} gridColumn={gridColumn} />;
      })}
    </StyledContainer>
  );
};

const StyledContainer = styled(Container)`
${({ theme }) => css`
display: flex;
flex-direction: column;

  ${media.greaterThan('md')`
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: 1fr 1px auto;
    align-items: center;
    grid-auto-flow: row;
    column-gap: ${theme.spacing[7]};
    row-gap: ${theme.spacing[9]};
    padding-bottom: ${theme.spacing[9]};
    && {
      max-width: 1100px;
    }
    `}
  `}
`;

const MainContainer = styled(Box)<{ $inverted?: boolean }>`
${({ $inverted }) => css`
  grid-column: ${$inverted ? '4 / 7' : '1 / 4'};
  grid-row: 1;
`}
`;

const IllustrationContainer = styled(Box)<{ $inverted?: boolean }>`
${({ $inverted, theme }) => css`
  grid-column: ${$inverted ? '1 / 3' : '4 / 7'};
  grid-row: 1;
  width: 100%;
  padding: ${theme.spacing[7]} 0 ${theme.spacing[7]} 0;

  ${media.greaterThan('md')`
    padding: 0;
  `}
`}
`;

const Divider = styled(Box)`
${({ theme }) => css`
  grid-column: 1 / 7;
  grid-row: 2;
  background: radial-gradient(100% 90% at 50% 50%, ${theme.borderColor.tertiary} 0, transparent 75%);
  height: 1px;
  display: none;

  ${media.greaterThan('md')`
    display: block;
  `}
  `}
`;

export default SectionLayout;
