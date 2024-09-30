import type { DataIdentifier, Entity, VaultValue } from '@onefootprint/types';
import { Form } from '@onefootprint/ui';
import get from 'lodash/get';
import { useFormContext } from 'react-hook-form';
import styled, { css } from 'styled-components';
import { EMPTY_SELECT_VALUE, FIELD_VALUE_WIDTH } from '../../../../constants';
import useFieldProps from '../../../../utils/use-field-props';

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
  const { selectOptions, inputOptions } = useFieldProps(entity, fieldName);

  const error = get(errors, fieldName);

  return selectOptions ? (
    <SelectValueContainer
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
  ) : (
    <InputValueContainer
      size="compact"
      width={FIELD_VALUE_WIDTH}
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
};

const SelectValueContainer = styled(Form.Select)`
  ${({ theme }) => css`
      height: ${theme.spacing[8]};
      min-width: ${FIELD_VALUE_WIDTH};
  `}
`;

const InputValueContainer = styled(Form.Input)`
    min-width: ${FIELD_VALUE_WIDTH};
`;

export default Editable;
