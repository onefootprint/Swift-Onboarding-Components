/* eslint-disable react/jsx-props-no-spreading */
import { IcoChevronDown16, IcoCloseSmall16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import noop from 'lodash/noop';
import React from 'react';
import {
  ClearIndicatorProps,
  components,
  DropdownIndicatorProps,
  GroupBase,
  IndicatorSeparatorProps,
  MultiValueRemoveProps,
  OptionProps,
} from 'react-select';

import { createFontStyles } from '../../../utils/mixins';
import Checkbox from '../../checkbox';

export const ClearIndicator = <
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
>(
  props: ClearIndicatorProps<Option, IsMulti, Group>,
) => (
  <components.ClearIndicator {...props}>
    <IcoCloseSmall16 color="quaternary" />
  </components.ClearIndicator>
);

export const IndicatorSeparator = <
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
>(
  props: IndicatorSeparatorProps<Option, IsMulti, Group>,
) => {
  const { hasValue } = props;
  return hasValue ? <components.IndicatorSeparator {...props} /> : null;
};

export const DropdownIndicator = <
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
>({
  children,
  innerProps,
}: DropdownIndicatorProps<Option, IsMulti, Group>) => (
  <div {...innerProps}>{children || <IcoChevronDown16 color="primary" />}</div>
);

export const MultiValueRemove = <
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
>({
  children,
  innerProps,
}: MultiValueRemoveProps<Option, IsMulti, Group>) => (
  <div role="button" {...innerProps}>
    {children || <IcoCloseSmall16 color="tertiary" />}
  </div>
);

export const Option = <
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
>(
  props: OptionProps<Option, IsMulti, Group>,
) => {
  const {
    children,
    isDisabled,
    isFocused,
    isSelected,
    innerRef,
    selectProps,
    innerProps,
  } = props;
  // TODO: https://linear.app/footprint/issue/FP-4512/fix-ts-on-multi-select
  // @ts-ignore
  const { value, allOption } = selectProps;
  const isAllChecked =
    // @ts-ignore
    allOption && value?.some(option => option.value === allOption.value);

  return (
    <CustomOption
      aria-disabled={isDisabled}
      aria-selected={isSelected}
      data-focused={isFocused}
      // @ts-ignore
      ref={innerRef}
      role="option"
      {...innerProps}
    >
      <Checkbox
        checked={isSelected || isAllChecked}
        disabled={isDisabled}
        id={innerProps.id}
        onChange={noop}
      />
      {children}
    </CustomOption>
  );
};

const CustomOption = styled.div`
  ${({ theme }) => {
    const {
      components: { dropdown },
    } = theme;

    return css`
      ${createFontStyles('body-3')};
      align-items: center;
      color: ${dropdown.colorPrimary};
      cursor: pointer;
      display: flex;
      height: 36px;
      padding: 0 ${theme.spacing[5]};
      user-select: none;
      width: 100%;
      gap: ${theme.spacing[4]};

      input[type='checkbox'] {
        position: relative;
        top: calc(-1 * ${theme.spacing[1]});
      }

      &:hover {
        background: ${dropdown.hover.bg};
      }

      &[data-focused='true'] {
        background: ${dropdown.hover.bg};
      }
    `;
  }}
`;
