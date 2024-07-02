import { Box, Text, media } from '@onefootprint/ui';
import { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type CardProps = {
  translationKey: string;
  illustration: React.ReactNode;
  $inverted?: boolean;
  $faded?: boolean;
};

const Card = ({ translationKey, illustration, $inverted, $faded }: CardProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.doc-scan.grid-cards.cards' });
  return (
    <Container $inverted={$inverted}>
      <IllustrationContainer $faded={$faded}>{illustration}</IllustrationContainer>
      <TextContainer>
        <Text variant="label-3" color="accent" marginBottom={3}>
          {t(`${translationKey}.label` as ParseKeys<'common'>)}
        </Text>
        <Text variant="heading-3">{t(`${translationKey}.title` as ParseKeys<'common'>)}</Text>
        <Text variant="body-1">{t(`${translationKey}.subtitle` as ParseKeys<'common'>)}</Text>
      </TextContainer>
    </Container>
  );
};

const Container = styled.div<{ $inverted?: boolean }>`
${({ theme, $inverted }) => `
  display: flex;
  flex-direction: ${$inverted ? 'column-reverse' : 'column'};
  align-items: center;
  border-radius: ${theme.borderRadius.default};
  border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  height: 100%;
  overflow: hidden;
`}
`;

const TextContainer = styled.div`
  ${({ theme }) => css`
  padding: ${theme.spacing[9]};
  gap: ${theme.spacing[3]};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  
`}
`;

const IllustrationContainer = styled(Box)<{ $faded?: boolean }>`
${({ $faded }) => css`
  flex: 1;
  width: 100%;
  min-height: 240px;
  position: relative;
  height: 100%;
  mask: ${$faded ? 'linear-gradient(to bottom, black 0%, black 75%, transparent 100%)' : 'none'};
  mask-repeat: no-repeat;
  mask-position: center;
  mask-type: alpha;
  max-height: 320px;
  flex:1; 

  ${media.greaterThan('md')`
    max-height: none;
  `}
`}
`;

export default Card;
