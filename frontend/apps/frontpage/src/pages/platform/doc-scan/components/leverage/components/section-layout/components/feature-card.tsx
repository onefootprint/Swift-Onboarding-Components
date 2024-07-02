import type { Icon } from '@onefootprint/icons';
import { Box, Stack, Text } from '@onefootprint/ui';
import { media } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

export type FeatureCardProps = {
  title: string;
  description: string;
  icon: Icon;
};

const FeatureCard = ({ title, description, icon: Icon, gridColumn }: FeatureCardProps & { gridColumn: string }) => (
  <CardContainer $gridColumn={gridColumn} width="100%" gap={5}>
    <Stack direction="row" align="center" width="100%" gap={3} justify="center">
      <Stack flex={0}>
        <Icon />
      </Stack>
      <Text variant="label-3" width="100%">
        {title}
      </Text>
    </Stack>
    <Text variant="body-3" color="secondary">
      {description}
    </Text>
  </CardContainer>
);

const CardContainer = styled(Box)<{ $gridColumn: string }>`
${({ $gridColumn, theme }) => css`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: flex-start;
  align-items: flex-start;
  grid-column: ${$gridColumn};
  grid-row: 3;
  max-width: 100%;
  padding: ${theme.spacing[9]} 0 0 0;

  ${media.greaterThan('md')`
    padding: 0;
  `}
`}
`;

export default FeatureCard;
