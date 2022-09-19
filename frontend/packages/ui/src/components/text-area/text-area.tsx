import React, { forwardRef, TextareaHTMLAttributes } from 'react';
import styled, { css } from 'styled-components';

import Box from '../box';
import Field, { FieldProps } from '../internal/field';
import Hint from '../internal/hint';
import Label from '../internal/label';

export type TextAreaProps = FieldProps &
  TextareaHTMLAttributes<HTMLTextAreaElement>;

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      testID,
      hasError,
      hint,
      id: baseID,
      label,
      onChange,
      onChangeText,
      placeholder,
      required,
      ...remainingProps
    }: TextAreaProps,
    ref,
  ) => {
    const id = baseID || `input-${label || placeholder}`;
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        onChange(event);
      }
      if (onChangeText) {
        onChangeText(event.currentTarget.value);
      }
    };

    return (
      <Box>
        {label && <Label htmlFor={id}>{label}</Label>}
        <StyledField
          {...remainingProps}
          $hasError={hasError}
          aria-required={required}
          as="textarea"
          data-testid={testID}
          id={id}
          onChange={handleChange}
          placeholder={placeholder}
          ref={ref}
        />
        {hint && <Hint color={hasError ? 'error' : 'tertiary'}>{hint}</Hint>}
      </Box>
    );
  },
);

const StyledField = styled(Field)<TextAreaProps>`
  resize: none;
  ${({ theme }) => css`
    padding: ${theme.spacing[4]}px ${theme.spacing[5]}px;
    min-height: ${theme.spacing[11]}px;
  `}
`;

export default TextArea;
