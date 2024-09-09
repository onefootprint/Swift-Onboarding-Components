import { IcoCheck24 } from '@onefootprint/icons';
import React, { useState } from 'react';
import styled, { css } from 'styled-components/native';

import Box from '../../box';
import Pressable from '../../pressable';
import Typography from '../../typography';

type ItemProps = {
  label: string;
  onPress: () => void;
  selected: boolean;
};

const Item = ({ label, selected, onPress }: ItemProps) => {
  const [active, setActive] = useState(false);

  return (
    <Pressable onPress={onPress} onPressIn={() => setActive(true)} onPressOut={() => setActive(false)}>
      <ItemContainer active={active}>
        <Label variant="body-3">{label}</Label>
        <Box>{selected ? <IcoCheck24 /> : null}</Box>
      </ItemContainer>
    </Pressable>
  );
};

const ItemContainer = styled.View<{ active: boolean }>`
  ${({ theme, active }) => {
    const { dropdown } = theme.components;
    return css`
      background-color: ${active ? dropdown.active.bg : dropdown.bg};
      flex-direction: row;
      justify-content: space-between;
      padding-horizontal: ${theme.spacing[5]};
      padding-vertical: ${theme.spacing[4]};
    `;
  }}
`;

const Label = styled(Typography)`
  ${({ theme }) => {
    const { dropdown } = theme.components;
    return css`
      color: ${dropdown.color};
    `;
  }}
`;

export default Item;
