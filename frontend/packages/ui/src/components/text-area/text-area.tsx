import React, { forwardRef, TextareaHTMLAttributes } from 'react';
import styled, { css } from 'styled';

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
      disabled,
      hasError,
      hintText,
      id: baseID,
      label,
      onChange,
      onChangeText,
      placeholder,
      required,
      tabIndex,
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
          aria-required={required}
          as="textarea"
          data-testid={testID}
          disabled={disabled}
          hasError={hasError}
          id={id}
          onChange={handleChange}
          placeholder={placeholder}
          ref={ref}
          tabIndex={disabled ? -1 : tabIndex}
        />
        {hintText && (
          <Hint color={hasError ? 'error' : 'tertiary'}>{hintText}</Hint>
        )}
      </Box>
    );
  },
);

const StyledField = styled(Field)<TextAreaProps>`
  ${({ theme }) => css`
    padding: ${theme.spacing[4]}px ${theme.spacing[5]}px;
    min-height: ${theme.spacing[11]}px;
  `}
`;

export default TextArea;
