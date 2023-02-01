/* eslint-disable react/jsx-props-no-spreading */
import { IcoChevronDown16, IcoCloseSmall16 } from '@onefootprint/icons';
import React from 'react';
import {
  ClearIndicatorProps,
  components,
  DropdownIndicatorProps,
  GroupBase,
  IndicatorSeparatorProps,
  MultiValueRemoveProps,
} from 'react-select';

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
