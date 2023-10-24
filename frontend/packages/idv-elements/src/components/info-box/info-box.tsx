import type { Icon } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Grid, Stack, Typography } from '@onefootprint/ui';
import React from 'react';

export type InfoBoxProps = {
  items: { title: string; description?: string; Icon: Icon }[];
  variant: 'default' | 'compact';
};

const InfoBox = ({ items, variant }: InfoBoxProps) => (
  <Grid.Container
    width="100%"
    as="ul"
    backgroundColor="secondary"
    borderRadius="default"
    data-variant={variant}
    aria-label="infoBox"
    gap={variant === 'compact' ? 4 : 7}
    padding={variant === 'compact' ? 4 : 5}
  >
    {items.map(({ title, description, Icon }) => (
      <Stack as="li" direction="row" gap={3} title={title} key={title}>
        <IconContainer>
          <Icon color="primary" />
        </IconContainer>
        <Stack direction="column" gap={variant === 'default' ? 3 : 2}>
          <Typography color="primary" variant="label-3">
            {title}
          </Typography>
          {description && (
            <Typography color="secondary" variant="body-3">
              {description}
            </Typography>
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
