import { Box, Stack, Text, createFontStyles, media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type FeatureCardProps = {
  illustration: React.ReactNode;
  tag: string;
  title: string;
  subtitle: string;
  area: string;
};

const FeatureCard = ({ illustration: Illustration, tag, title, subtitle, area }: FeatureCardProps) => {
  return (
    <CardContainer area={area}>
      <Tag>From {tag}</Tag>
      <IllustrationContainer>{Illustration}</IllustrationContainer>
      <TextContainer>
        <Text variant="heading-3" width="100%">
          {title}
        </Text>
        <Text variant="body-1" width="100%" color="tertiary">
          {subtitle}
        </Text>
      </TextContainer>
    </CardContainer>
  );
};

const TextContainer = styled(Stack)`
  ${({ theme }) => css`
    flex-direction: column;
    gap: ${theme.spacing[2]};
    align-items: center;
    justify-content: flex-start;
    margin-top: ${theme.spacing[2]};
    width: 100%;

    ${media.greaterThan('md')`
      flex: 1;
    `}
  `}
`;

const CardContainer = styled(Box)<{ area: string }>`
  ${({ area, theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
    align-items: center;
    justify-content: center;
    grid-area: ${area};
    width: 100%;
    margin: 0 auto;
    height: fit-content;
  `}
`;

const Tag = styled(Box)`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    color: ${theme.color.info};
    border-radius: ${theme.borderRadius.full};
    background-color: ${theme.backgroundColor.info};
    padding: ${theme.spacing[2]} ${theme.spacing[4]};
  `}
`;

const IllustrationContainer = styled(Box)`
  ${({ theme }) => css`
    position: relative;
    border-radius: ${theme.borderRadius.default};
    background-color: ${theme.backgroundColor.secondary};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    width: 100%;
    height: 280px;
    overflow: hidden;
  `}
`;

export default FeatureCard;
