import type { Icon } from '@onefootprint/icons';
import { Grid, Stack, Text } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

export type InfoBoxProps = {
  items: { title: string; description?: string; Icon: Icon }[];
  variant: 'default' | 'compact';
};

const InfoBox = ({ items, variant }: InfoBoxProps) => (
  <Grid.Container
    aria-label="infoBox"
    backgroundColor="secondary"
    borderRadius="default"
    data-variant={variant}
    gap={variant === 'compact' ? 4 : 7}
    padding={variant === 'compact' ? 4 : 5}
    tag="ul"
    width="100%"
  >
    {items.map(({ title, description, Icon }) => (
      <Stack tag="li" direction="row" gap={3} title={title} key={title}>
        <IconContainer>
          <Icon color="primary" />
        </IconContainer>
        <Stack direction="column" gap={variant === 'default' ? 3 : 2}>
          <Text color="primary" variant="label-3">
            {title}
          </Text>
          {description && (
            <Text color="secondary" variant="body-3">
              {description}
            </Text>
          )}
        </Stack>
      </Stack>
    ))}
  </Grid.Container>
);

const IconContainer = styled.div`
  ${({ theme }) => css`
    position: relative;
    top: -${theme.spacing[1]};
  `}
`;

export default InfoBox;
