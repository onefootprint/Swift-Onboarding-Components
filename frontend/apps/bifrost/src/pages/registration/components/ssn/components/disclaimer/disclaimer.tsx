import type { Icon as TIcon } from 'icons';
import React from 'react';
import styled, { css } from 'styled';
import { Box, Typography } from 'ui';

type DisclaimerProps = {
  items: { title: string; description: string; Icon: TIcon }[];
};

const Disclaimer = ({ items }: DisclaimerProps) => (
  <Container>
    {items.map(({ title, description, Icon }) => (
      <Item title={title}>
        <Box>
          <Icon color="primary" />
        </Box>
        <Box>
          <Typography
            color="primary"
            sx={{ marginBottom: 3 }}
            variant="label-3"
          >
            {title}
          </Typography>
          <Typography color="secondary" variant="body-3">
            {description}
          </Typography>
        </Box>
      </Item>
    ))}
  </Container>
);

const Container = styled.ul`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius[1]}px;
    display: grid;
    gap: ${theme.spacing[7]}px;
    padding: ${theme.spacing[5]}px;
  `}
`;

const Item = styled.li`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[3]}px;
  `}
`;

export default Disclaimer;
