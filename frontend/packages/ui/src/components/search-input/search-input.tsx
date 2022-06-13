import IcoSearch16 from 'icons/ico/ico-search-16';
import React from 'react';
import styled, { css } from 'styled-components';
import { Spacings } from 'themes';

import Input, { InputProps } from '../internal/input';

export type SearchInputProps = InputProps & {
  inputSize?: InputSize;
  suffixElement?: React.ReactNode;
};

type InputSize = 'default' | 'large' | 'compact';

const sizeToHeight: Record<InputSize, string> = {
  default: '40px',
  large: '48px',
  compact: '32px',
};

const sizeToIconMargin: Record<InputSize, keyof Spacings> = {
  default: 5,
  large: 5,
  compact: 4,
};

const sizeToInputPadding: Record<InputSize, keyof Spacings> = {
  default: 9,
  large: 9,
  compact: 8,
};

const SearchInput = ({
  inputSize = 'default',
  ...remainingProps
}: SearchInputProps) => (
  <Input
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...remainingProps}
    fontVariant={inputSize === 'compact' ? 'body-4' : 'body-3'}
    sx={{
      paddingLeft: sizeToInputPadding[inputSize],
      height: sizeToHeight[inputSize],
    }}
    prefixElement={
      <PrefixContainer inputSize={inputSize}>
        {/* TODO make search logo 11px instead of 13px for compact */}
        <IcoSearch16 />
      </PrefixContainer>
    }
  />
);

const PrefixContainer = styled.div<{ inputSize: InputSize }>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ theme, inputSize }) => css`
    height: ${sizeToHeight[inputSize]};
    margin-left: ${theme.spacing[sizeToIconMargin[inputSize]]}px;
  `};
`;

export default SearchInput;
