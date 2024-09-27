import type { DataIdentifier, VaultValue } from '@onefootprint/types';
import { Form } from '@onefootprint/ui';
import get from 'lodash/get';
import { useFormContext } from 'react-hook-form';
import styled, { css } from 'styled-components';
import { EMPTY_SELECT_VALUE, FIELD_VALUE_WIDTH } from '../../constants';
import useFieldProps from '../../utils/use-field-props';

export type EditableProps = {
  value: VaultValue;
  fieldName: DataIdentifier;
};

const Editable = ({ value, fieldName }: EditableProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const { selectOptions, inputOptions } = useFieldProps(fieldName);
  const error = get(errors, fieldName);

  return selectOptions ? (
    <SelectValueContainer>
      <Form.Select
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
      </Form.Select>
    </SelectValueContainer>
  ) : (
    <InputValueContainer>
      <Form.Input
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
      {error && <Form.Errors textAlign="left">{error?.message}</Form.Errors>}
      {inputOptions?.hint && !error && <Form.Hint textAlign="right">{inputOptions?.hint}</Form.Hint>}
    </InputValueContainer>
  );
};

const SelectValueContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    flex: 1;

    select {
      height: ${theme.spacing[8]};
      min-width: ${FIELD_VALUE_WIDTH};
    }
  `}
`;

const InputValueContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  input {
    min-width: ${FIELD_VALUE_WIDTH};
  }
`;

export default Editable;
