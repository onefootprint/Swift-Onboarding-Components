import { IcoChevronDown24 } from '@onefootprint/icons';
import type { CountryCode } from '@onefootprint/types';
import styled, { css } from 'styled-components';

import { createText } from '../../../../../../utils';
import Box from '../../../../../box';
import Flag from '../../../../../flag';

type CountryPickerProps = {
  code: CountryCode;
  disabled: boolean;
  onClick?: () => void;
  prefix: string;
};

const CountryPicker = ({ prefix, disabled, code, onClick }: CountryPickerProps) => (
  <Button onClick={onClick} type="button" disabled={disabled}>
    <Box marginLeft={4}>
      <Flag code={code} />
    </Box>
    <Box marginLeft={2}>
      <DropdownIndicator />
    </Box>
    <Box marginLeft={3}>{prefix}</Box>
  </Button>
);

const Button = styled.button`
  ${({ theme }) => {
    const {
      components: { input },
    } = theme;

    return css`
      ${createText(input.size.default.typography)}
      align-items: center;
      background: none;
      border: none;
      color: inherit;
      display: flex;
      height: 100%;
      justify-content: center;
      user-select: none;
      padding: 0 calc(${theme.spacing[2]} + ${theme.spacing[1]});

      &:enabled {
        cursor: pointer;
      }

      > div {
        display: flex;
      }
    `;
  }}
`;

const DropdownIndicator = styled(IcoChevronDown24)``;

export default CountryPicker;
