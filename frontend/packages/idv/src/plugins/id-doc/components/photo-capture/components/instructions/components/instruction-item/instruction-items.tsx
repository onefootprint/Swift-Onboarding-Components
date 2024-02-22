import type { Icon } from '@onefootprint/icons';
import { Stack, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

export type InstructionItemsProps = {
  items: { title: string; description?: string; Icon: Icon }[];
};

const InstructionItems = ({ items }: InstructionItemsProps) => (
  <Container aria-label="instructionItems">
    {items.map(({ title, description, Icon }) => (
      <Item title={title} key={title}>
        <IconContainer>
          <Icon color="primary" />
        </IconContainer>
        <Stack direction="column" gap={3}>
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
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    display: grid;
    width: 100%;
    gap: ${theme.spacing[7]};
    padding: ${theme.spacing[3]} 0;
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

export default InstructionItems;
