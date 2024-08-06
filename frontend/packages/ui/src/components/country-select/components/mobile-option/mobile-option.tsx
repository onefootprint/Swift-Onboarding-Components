import { IcoCheck24 } from '@onefootprint/icons';
import type { CountryCode } from '@onefootprint/types';
import styled, { css } from 'styled-components';

import Box from '../../../box';
import flag from '../../../flag';
import type { ItemProps } from '../../../internal/base-select/components/picker/components/item';
import Text from '../../../text';

type MobileOptionProps = ItemProps;

const MobileOption = ({ option, onSelect, value }: MobileOptionProps) => {
  const { label } = option;
  const selected = value?.value === option.value;

  return (
    <Box role="option" onClick={onSelect} tabIndex={0}>
      <OptionContainer>
        <Box display="flex" alignItems="center">
          {value && <StyledFlag code={option.value as CountryCode} />}
          <Label variant="body-4">{label}</Label>
        </Box>
        <Box>{selected ? <IcoCheck24 /> : null}</Box>
      </OptionContainer>
    </Box>
  );
};

const OptionContainer = styled.div`
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

const StyledFlag = styled(flag)`
  ${({ theme }) => css`
    margin-right: ${theme.spacing[3]};
    min-width: 20px;
  `}
`;

export default MobileOption;
