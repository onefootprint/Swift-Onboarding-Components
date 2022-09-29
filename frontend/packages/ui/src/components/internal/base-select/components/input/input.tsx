import { IcoSearch16 } from '@onefootprint/icons';
import React from 'react';
import { CommonPropsAndClassName, GroupBase } from 'react-select';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../../../../utils/mixins';
import cleanCommonProps from '../../base-select.utils';

export type InputSpecificProps<
  Option = unknown,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>,
> = CommonPropsAndClassName<Option, IsMulti, Group> &
  React.InputHTMLAttributes<HTMLInputElement> & {
    innerRef?: (instance: HTMLInputElement | null) => void;
    isHidden: boolean;
    isDisabled?: boolean;
    form?: string;
    inputClassName?: string;
  };

export type InputProps<
  Option = unknown,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>,
> = InputSpecificProps<Option, IsMulti, Group>;

const Input = <
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
>({
  selectProps,
  ...rest
}: InputProps<Option, IsMulti, Group>) => {
  const { innerRef, isDisabled, isHidden, inputClassName, ...innerProps } =
    cleanCommonProps(rest);

  return (
    <InputContainer>
      <IcoSearch16 color="quaternary" />
      <SearchInput
        ref={innerRef}
        disabled={isDisabled}
        placeholder={selectProps.placeholder as string}
        {...innerProps}
      />
    </InputContainer>
  );
};

const InputContainer = styled.div`
  ${({ theme }) => css`
    padding: 0 ${theme.spacing[3]}px;
    align-items: center;
    display: flex;
    gap: ${theme.spacing[3]}px;
  `}
`;

const SearchInput = styled.input`
  ${({ theme }) => css`
    ${createFontStyles('body-3')};
    color: ${theme.color.primary};
    border: none;
    outline: none;
    height: 100%;

    ::placeholder {
      color: ${theme.color.quaternary};
    }
  `}
`;

export default Input;
