import type { DataIdentifier, Entity, VaultArrayData, VaultValue } from '@onefootprint/types';
import { Form, Stack } from '@onefootprint/ui';
import get from 'lodash/get';
import { useFormContext } from 'react-hook-form';
import styled, { css } from 'styled-components';
import { EMPTY_SELECT_VALUE, FIELD_VALUE_WIDTH } from '../../constants';
import useFieldProps from '../../utils/use-field-props';

export type EditableProps = {
  entity: Entity;
  value: VaultValue;
  fieldName: DataIdentifier;
};

const Editable = ({ entity, value, fieldName }: EditableProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const { selectOptions, inputOptions, radioOptions, checkboxOptions } = useFieldProps(entity, fieldName);

  const error = get(errors, fieldName);

  if (selectOptions) {
    return (
      <SelectValueContainer
        data-full-width={selectOptions.fullWidth}
        size="compact"
        data-dd-privacy="mask:"
        aria-label={selectOptions['aria-label']}
        defaultValue={(value as string) || EMPTY_SELECT_VALUE}
        {...register(fieldName, {
          ...selectOptions,
          required: selectOptions.required,
          validate: selectOptions.validate,
          onChange: selectOptions.onChange,
        })}
      >
        {selectOptions.options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectValueContainer>
    );
  }
  if (inputOptions) {
    return (
      <InputValueContainer
        data-full-width={inputOptions.fullWidth}
        size="compact"
        placeholder={inputOptions?.placeholder ?? ''}
        type={inputOptions?.type || 'text'}
        defaultValue={value as string}
        hasError={!!error}
        {...register(fieldName, {
          ...inputOptions,
          required: inputOptions?.required,
          validate: inputOptions?.validate,
          onChange: inputOptions?.onChange,
          pattern: inputOptions?.pattern
            ? { value: new RegExp(inputOptions.pattern?.value), message: inputOptions.pattern.message }
            : undefined,
        })}
      />
    );
  }
  if (radioOptions) {
    return (
      <Stack direction="column" gap={4}>
        {radioOptions.options.map(option => (
          <Form.Radio
            key={option.value}
            label={option.label}
            value={option.value}
            defaultChecked={value === option.value}
            hasError={!!error}
            {...register(fieldName, {
              required: radioOptions.required,
              validate: radioOptions.validate,
              onChange: radioOptions.onChange,
            })}
            id={option.value}
          />
        ))}
      </Stack>
    );
  }
  return (
    <Stack direction="column" gap={4}>
      {checkboxOptions.options.map(option => (
        <Form.Checkbox
          key={option.value}
          label={option.label}
          value={option.value}
          defaultChecked={!!value && (value as VaultArrayData).includes(option.value)}
          hasError={!!error}
          {...register(fieldName, {
            required: checkboxOptions.required,
            validate: checkboxOptions.validate,
            onChange: checkboxOptions.onChange,
          })}
          id={option.value}
        />
      ))}
    </Stack>
  );
};

const SelectValueContainer = styled(Form.Select)`
  ${({ theme }) => css`
    height: ${theme.spacing[8]};
    min-width: ${FIELD_VALUE_WIDTH};
    &[data-full-width='true'] {
      width: 100%;
    }
  `}
`;

const InputValueContainer = styled(Form.Input)`
  min-width: ${FIELD_VALUE_WIDTH};
  &[data-full-width='true'] {
    width: 100%;
  }
`;

export default Editable;
