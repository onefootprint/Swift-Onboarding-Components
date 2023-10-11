import type { Icon } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Stack, Typography } from '@onefootprint/ui';
import React from 'react';

export type InfoBoxProps = {
  items: { title: string; description?: string; Icon: Icon }[];
  variant: 'default' | 'compact';
};

const InfoBox = ({ items, variant }: InfoBoxProps) => (
  <Container data-variant={variant} aria-label="infoBox">
    {items.map(({ title, description, Icon }) => (
      <Item title={title} key={title}>
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
      </Item>
    ))}
  </Container>
);

const Container = styled.ul`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.default};
    display: grid;
    width: 100%;

    &[data-variant='default'] {
      gap: ${theme.spacing[7]};
      padding: ${theme.spacing[5]};
    }

    &[data-variant='compact'] {
      gap: ${theme.spacing[4]};
      padding: ${theme.spacing[4]};
    }
  `}
`;

const Item = styled.li`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[3]};
  `}
`;

const IconContainer = styled.div`
  ${({ theme }) => css`
    position: relative;
    top: -${theme.spacing[1]};
  `}
`;

export default InfoBox;
