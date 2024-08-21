import { Box, Stack, Text } from '@onefootprint/ui';
import type React from 'react';
import styled, { css } from 'styled-components';

type FeaturedCardProps = {
  title: string;
  subtitle: string;
  illustration: React.ReactNode;
};

const FeaturedCard = ({ title, subtitle, illustration }: FeaturedCardProps) => (
  <Card direction="column">
    <Stack height="252px" width="100%" align="center" justify="center">
      {illustration}
    </Stack>
    <TextContent>
      <Text variant="label-1" tag="h4">
        {title}.
        <Box tag="span" width="4px" display="inline-block" />
        <Text variant="label-1" color="tertiary" tag="span">
          {subtitle}
        </Text>
      </Text>
    </TextContent>
  </Card>
);

const Card = styled(Stack)`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    width: 100%;
    max-width: 420px;
    overflow: hidden;
  `}
`;

const TextContent = styled(Stack)`
  ${({ theme }) => css`
    padding: ${theme.spacing[9]};
  `}
`;

export default FeaturedCard;
