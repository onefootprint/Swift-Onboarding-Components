import { IcoCheck24 } from '@onefootprint/icons';
import styled, { css } from 'styled-components';

import Box from '../../../../../../box';
import Text from '../../../../../../text';
import type { BaseSelectOption } from '../../../../base-select.types';

export type ItemProps = {
  option: BaseSelectOption;
  value?: BaseSelectOption;
  onSelect: () => void;
};

const Item = ({ option, value, onSelect }: ItemProps) => {
  const { label } = option;
  const selected = option.value === value?.value;

  return (
    <Box role="option" onClick={onSelect} tabIndex={0}>
      <ItemContainer>
        <Label variant="body-4">{label}</Label>
        <Box>{selected ? <IcoCheck24 /> : null}</Box>
      </ItemContainer>
    </Box>
  );
};

const ItemContainer = styled.div`
  ${({ theme }) => {
    const { dropdown } = theme.components;
    return css`
      display: flex;
      background-color: ${dropdown.bg};
      flex-direction: row;
      justify-content: space-between;
      padding: ${theme.spacing[4]} ${theme.spacing[5]};

      &:hover {
        background-color: ${dropdown.hover.bg};
        cursor: pointer;
      }
    `;
  }}
`;

const Label = styled(Text)`
  ${({ theme }) => {
    const { dropdown } = theme.components;
    return css`
      color: ${dropdown.colorPrimary};
    `;
  }}
`;

export default Item;
