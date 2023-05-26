import React, { useId } from 'react';
import Select, {
  ActionMeta,
  GroupBase,
  InputActionMeta,
  OptionsOrGroups,
  PropsValue,
} from 'react-select';
import { useTheme } from 'styled-components';

import Box from '../box';
import Label from '../form-label';
import Hint from '../internal/hint';
import {
  ClearIndicator,
  DropdownIndicator,
  IndicatorSeparator,
  MultiValueRemove,
} from './components';

export type MultiSelectProps<Option, Group extends GroupBase<Option>> = {
  autoFocus?: boolean;
  defaultValue?: PropsValue<Option>;
  disabled?: boolean;
  emptyStateText?: string;
  id?: string;
  label?: string;
  name?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onChange?: (
    option: readonly Option[],
    actionMeta: ActionMeta<Option>,
  ) => void;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onInputChange?: (newValue: string, actionMeta: InputActionMeta) => void;
  options: OptionsOrGroups<Option, Group> | undefined;
  placeholder?: string;
  required?: boolean;
  hasError?: boolean;
  hint?: string;
  size?: 'default' | 'compact';
  value?: PropsValue<Option>;
};

const MultiSelect = <
  Option,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({
  autoFocus,
  defaultValue,
  disabled,
  emptyStateText = 'No results found',
  id: baseId,
  label,
  name,
  onBlur,
  onChange,
  onFocus,
  onInputChange,
  options,
  placeholder = 'Search...',
  required,
  hasError = false,
  hint,
  size,
  value,
}: MultiSelectProps<Option, Group>) => {
  const internalId = useId();
  const id = baseId || internalId;
  const theme = useTheme();
  const { dropdown, input } = theme.components;
  const inputSize =
    size === 'compact' ? input.size.compact : input.size.default;

  return (
    <Box>
      {label && (
        <Label htmlFor={id} size={size}>
          {label}
        </Label>
      )}
      <Select<Option, true, Group>
        autoFocus={autoFocus}
        escapeClearsValue={false}
        closeMenuOnSelect={false}
        components={{
          ClearIndicator,
          DropdownIndicator,
          IndicatorSeparator,
          MultiValueRemove,
        }}
        menuPlacement="auto"
        defaultValue={defaultValue}
        inputId={id}
        isDisabled={disabled}
        isMulti
        name={name}
        noOptionsMessage={() => emptyStateText}
        onBlur={onBlur}
        onChange={onChange}
        onFocus={onFocus}
        onInputChange={onInputChange}
        openMenuOnFocus
        options={options}
        placeholder={placeholder}
        required={required}
        value={value}
        styles={{
          menu: base => ({
            ...base,
            backgroundColor: dropdown.bg,
            borderRadius: dropdown.borderRadius,
            boxShadow: dropdown.elevation,
            marginBottom: theme.spacing[3],
            marginTop: theme.spacing[3],
            borderColor: dropdown.borderColor,
            borderStyle: 'solid',
            borderWidth: dropdown.borderWidth,
          }),
          menuList: base => ({
            ...base,
            borderRadius: input.global.borderRadius,
          }),
          control: (base, { isFocused }) => ({
            background: input.state.default.initial.bg,
            borderColor: hasError
              ? `${input.state.error.initial.border}`
              : input.state.default.initial.border,
            borderRadius: input.global.borderRadius,
            borderStyle: 'solid',
            borderWidth: input.global.borderWidth,
            display: 'flex',
            ':hover': {
              ...(!isFocused && {
                background: input.state.default.hover.bg,
                borderColor: hasError
                  ? `${input.state.error.initial.border}`
                  : input.state.default.hover.border,
              }),
            },
            ...(isFocused && {
              background: input.state.default.focus.bg,
              borderColor: hasError
                ? `${input.state.error.initial.border}`
                : input.state.default.focus.border,
              boxShadow: input.state.default.focus.elevation,
            }),
          }),
          placeholder: base => ({
            ...base,
            font: inputSize.typography,
            color: input.global.placeholderColor,
            padding: `0 ${theme.spacing[3]}`,
          }),
          group: () => ({
            ':first-of-type': {
              marginTop: theme.spacing[1],
            },
            ':not(:last-child)': {
              marginBottom: theme.spacing[4],
            },
          }),
          option: (base, { isFocused }) => ({
            alignItems: 'center',
            background: dropdown.bg,
            color: dropdown.colorPrimary,
            cursor: 'pointer',
            display: 'flex',
            font: theme.typography['body-3'],
            height: '36px',
            padding: `0 ${theme.spacing[5]}`,
            userSelect: 'none',
            width: '100%',
            ':hover': {
              background: dropdown.hover.bg,
            },
            ...(isFocused && {
              background: dropdown.hover.bg,
            }),
          }),
          indicatorSeparator: base => ({
            ...base,
            backgroundColor: theme.borderColor.tertiary,
            marginTop: theme.spacing[3],
            marginBottom: theme.spacing[3],
          }),
          indicatorsContainer: () => ({
            alignItems: 'center',
            display: 'flex',
            gap: theme.spacing[3],
            justifyContent: 'center',
            margin: `${theme.spacing[0]} ${theme.spacing[5]}`,

            svg: {
              display: 'flex',
            },
          }),
          groupHeading: () => ({
            color: theme.color.tertiary,
            font: theme.typography['caption-3'],
            marginBottom: theme.spacing[2],
            padding: `${theme.spacing[3]} ${theme.spacing[5]} ${theme.spacing[2]}`,
            textTransform: 'uppercase',
          }),
          input: (base, { hasValue }) => ({
            ...base,
            color: input.global.color,
            font: inputSize.typography,
            margin: `${theme.spacing[1]} auto ${theme.spacing[1]} ${
              theme.spacing[hasValue ? 1 : 3]
            }`,
          }),
          valueContainer: base => ({
            ...base,
            padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
            gap: theme.spacing[3],
          }),
          multiValue: () => ({
            alignItems: 'center',
            backgroundColor: theme.backgroundColor.neutral,
            borderRadius: theme.borderRadius.compact,
            display: 'flex',
            flexDirection: 'row',
            gap: theme.spacing[3],
            justifyContent: 'space-between',
            padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
          }),
          multiValueLabel: () => ({
            font: theme.typography['body-4'],
          }),
          multiValueRemove: () => ({
            cursor: 'pointer',
            display: 'flex',
            ':hover path': {
              fill: theme.color.primary,
            },
          }),
          clearIndicator: () => ({
            cursor: 'pointer',
            ':hover path': {
              fill: theme.color.primary,
            },
          }),
          noOptionsMessage: () => ({
            color: theme.color.tertiary,
            font: theme.typography['body-3'],
            margin: `${theme.spacing[3]} ${theme.spacing[5]}`,
            textAlign: 'left',
          }),
        }}
      />
      {hint && <Hint hasError={hasError}>{hint}</Hint>}
    </Box>
  );
};

export default MultiSelect;
