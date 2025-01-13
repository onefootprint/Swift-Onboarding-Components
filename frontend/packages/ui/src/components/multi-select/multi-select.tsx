import type React from 'react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { ActionMeta, GroupBase, InputActionMeta, OptionsOrGroups, PropsValue } from 'react-select';
import Select from 'react-select';
import { useTheme } from 'styled-components';

import { createText } from '../../utils';
import Box from '../box';
import Hint from '../hint';
import Label from '../label';
import { ClearIndicator, DropdownIndicator, IndicatorSeparator, MultiValueRemove, Option } from './components';
import prependAllOption from './multi-select.utils';

type OptionType = { value: string; label: string };

export type MultiSelectProps<Option extends OptionType, Group extends GroupBase<Option> = GroupBase<Option>> = {
  autoFocus?: boolean;
  defaultValue?: PropsValue<Option>;
  disabled?: boolean;
  emptyStateText?: string;
  id?: string;
  label?: string;
  name?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onChange?: (option: readonly Option[], actionMeta: ActionMeta<Option>) => void;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onInputChange?: (newValue: string, actionMeta: InputActionMeta) => void;
  allOption?: Option;
  options: OptionsOrGroups<Option, Group> | undefined;
  placeholder?: string;
  required?: boolean;
  hasError?: boolean;
  hint?: string;
  size?: 'default' | 'compact';
  value?: readonly Option[];
};

const MultiSelect = <Option extends OptionType, Group extends GroupBase<Option>>({
  autoFocus,
  defaultValue,
  disabled,
  emptyStateText,
  id: baseId,
  label,
  name,
  onBlur,
  onChange,
  onFocus,
  onInputChange,
  options: initialOptions = [],
  placeholder,
  required,
  hasError = false,
  hint,
  size,
  value,
  allOption,
}: MultiSelectProps<Option, Group>) => {
  const { t } = useTranslation('ui');
  const internalId = useId();
  const id = baseId || internalId;
  const theme = useTheme();
  const options = (prependAllOption(initialOptions, allOption) as OptionsOrGroups<Option, Group>) || [];
  const { dropdown, input } = theme.components;
  const inputSize = size === 'compact' ? input.size.compact : input.size.default;

  const handleChange = (selectedOptions: readonly Option[], meta: ActionMeta<Option>) => {
    if (!allOption) {
      if (onChange) {
        onChange(selectedOptions, meta);
      }
    } else {
      const optionAll = allOption.value;
      const isAllSelected = selectedOptions.some(option => option.value === optionAll);
      const wasAllSelected = value?.some(option => option.value === optionAll);
      let newOptions = selectedOptions;

      if (isAllSelected && !wasAllSelected) {
        newOptions = [allOption];
      }
      if (isAllSelected && wasAllSelected) {
        if (selectedOptions.length > 1) {
          newOptions = selectedOptions.filter(option => option.value !== optionAll);
        }
      }
      if (onChange) {
        onChange(newOptions, meta);
      }
    }
  };

  const getNoOptionsMessage = () => emptyStateText ?? (t('components.multi-select.empty-state-text-default') as string);

  return (
    <Box>
      {label && (
        <Label htmlFor={id} size={size}>
          {label}
        </Label>
      )}
      <Select<Option, true, Group>
        // @ts-ignore
        allOption={allOption}
        autoFocus={autoFocus}
        escapeClearsValue={false}
        closeMenuOnSelect={false}
        components={{
          ClearIndicator,
          DropdownIndicator,
          IndicatorSeparator,
          MultiValueRemove,
          Option,
        }}
        defaultValue={defaultValue}
        hideSelectedOptions={false}
        inputId={id}
        isDisabled={disabled}
        isMulti
        menuPlacement="bottom"
        name={name}
        noOptionsMessage={getNoOptionsMessage}
        onBlur={onBlur}
        onChange={handleChange}
        onFocus={onFocus}
        onInputChange={onInputChange}
        openMenuOnFocus
        options={options}
        placeholder={placeholder ?? (t('components.multi-select.placeholder-default') as string)}
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
          }),
          menuList: base => ({
            ...base,
            borderColor: dropdown.borderColor,
            borderStyle: 'solid',
            borderWidth: dropdown.borderWidth,
            borderRadius: input.global.borderRadius,
            position: 'fixed',
            zIndex: 1000,
            width: '100%',
            backgroundColor: dropdown.bg,
            padding: '4px',
            maxWidth: '420px',
          }),
          control: (_base, { isFocused }) => ({
            background: input.state.default.initial.bg,
            borderColor: hasError ? `${input.state.error.initial.border}` : input.state.default.initial.border,
            borderRadius: input.global.borderRadius,
            borderStyle: 'solid',
            borderWidth: input.global.borderWidth,
            display: 'flex',
            ':hover': {
              ...(!isFocused && {
                background: input.state.default.hover.bg,
                borderColor: hasError ? `${input.state.error.initial.border}` : input.state.default.hover.border,
              }),
            },
            ...(isFocused && {
              background: input.state.default.focus.bg,
              borderColor: hasError ? `${input.state.error.initial.border}` : input.state.default.focus.border,
              boxShadow: input.state.default.focus.elevation,
            }),
          }),
          placeholder: base => ({
            ...base,
            ...createText(inputSize.typography),
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
            ...createText(theme.typography['caption-3']),
            marginBottom: theme.spacing[2],
            padding: `${theme.spacing[3]} ${theme.spacing[5]} ${theme.spacing[2]}`,
            textTransform: 'uppercase',
            ':empty': {
              height: theme.spacing[1],
              padding: 'unset',
            },
          }),
          input: (base, { hasValue }) => ({
            ...base,
            color: input.global.color,
            ...createText(inputSize.typography),
            margin: `${theme.spacing[1]} auto ${theme.spacing[1]} ${theme.spacing[hasValue ? 1 : 3]}`,
          }),
          valueContainer: base => ({
            ...base,
            padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
            gap: theme.spacing[3],
          }),
          multiValue: () => ({
            alignItems: 'center',
            backgroundColor: theme.backgroundColor.neutral,
            borderRadius: theme.borderRadius.sm,
            display: 'flex',
            flexDirection: 'row',
            gap: theme.spacing[3],
            justifyContent: 'space-between',
            padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
          }),
          multiValueLabel: () => ({
            ...createText(theme.typography['body-3']),
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
            ...createText(theme.typography['body-3']),
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
