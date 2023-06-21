import type { Icon } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Box, Typography } from '@onefootprint/ui';
import React from 'react';

export type InfoBoxProps = {
  items: { title: string; description?: string; Icon: Icon }[];
};

const InfoBox = ({ items }: InfoBoxProps) => (
  <Container>
    {items.map(({ title, description, Icon }) => (
      <Item title={title} key={title}>
        <IconContainer>
          <Icon color="primary" />
        </IconContainer>
        <Box>
          <Typography
            color="primary"
            sx={{ marginBottom: 3 }}
            variant="label-3"
          >
            {title}
          </Typography>
          {description && (
            <Typography color="secondary" variant="body-3">
              {description}
            </Typography>
          )}
        </Box>
      </Item>
    ))}
  </Container>
);

const Container = styled.ul`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.default};
    display: grid;
    gap: ${theme.spacing[7]};
    padding: ${theme.spacing[5]};
    width: 100%;
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
