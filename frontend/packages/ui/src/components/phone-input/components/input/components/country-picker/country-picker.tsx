import { IcoChevronDown24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import type { CountryCode } from '@onefootprint/types';
import React from 'react';

import Box from '../../../../../box';
import Flag from '../../../../../flag';

type CountryPickerProps = {
  code: CountryCode;
  disabled: boolean;
  onClick?: () => void;
  prefix: string;
};

const CountryPicker = ({
  prefix,
  disabled,
  code,
  onClick,
}: CountryPickerProps) => (
  <Button onClick={onClick} type="button" disabled={disabled}>
    <Box sx={{ marginLeft: 4 }}>
      <Flag code={code} />
    </Box>
    <Box sx={{ marginLeft: 2 }}>
      <DropdownIndicator />
    </Box>
    <Box sx={{ marginLeft: 3 }}>{prefix}</Box>
  </Button>
);

const Button = styled.button`
  ${({ theme }) => {
    const {
      components: { input },
    } = theme;

    return css`
      align-items: center;
      background: none;
      border: none;
      color: inherit;
      display: flex;
      font: ${input.size.default.typography};
      height: 100%;
      justify-content: center;
      user-select: none;

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
