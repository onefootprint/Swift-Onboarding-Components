import React, { useState } from 'react';
import styled, { css } from 'styled-components/native';

import Box from '../../box';
import Pressable from '../../pressable';
import Typography from '../../typography';

type ItemProps = {
  onPress: () => void;
  subtitle: string;
  title: string;
};

const Item = ({ onPress, subtitle, title }: ItemProps) => {
  const [active, setActive] = useState(false);

  return (
    <Pressable onPress={onPress} onPressIn={() => setActive(true)} onPressOut={() => setActive(false)}>
      <ItemContainer active={active}>
        <Box gap={2}>
          <Title variant="label-3">{title}</Title>
          <Subtitle variant="body-3" color="quaternary">
            {subtitle}
          </Subtitle>
        </Box>
      </ItemContainer>
    </Pressable>
  );
};

const ItemContainer = styled.View<{ active: boolean }>`
  ${({ theme, active }) => {
    const { dropdown } = theme.components;
    return css`
      background-color: ${active ? dropdown.active.bg : dropdown.bg};
      padding-horizontal: ${theme.spacing[5]};
      padding-vertical: ${theme.spacing[4]};
    `;
  }}
`;

const Title = styled(Typography)`
  ${({ theme }) => {
    const { dropdown } = theme.components;
    return css`
      color: ${dropdown.color};
    `;
  }}
`;

const Subtitle = styled(Typography)``;

export default Item;
