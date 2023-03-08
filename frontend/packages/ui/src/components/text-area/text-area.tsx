import React, { forwardRef, TextareaHTMLAttributes, useId } from 'react';
import styled, { css } from 'styled-components';

import Box from '../box';
import Label from '../form-label';
import Field, { FieldProps } from '../internal/field';
import Hint from '../internal/hint';

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
    const internalId = useId();
    const id = baseID || internalId;

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
          className="fp-textarea"
          data-has-error={hasError}
          data-size="default"
          data-testid={testID}
          id={id}
          onChange={handleChange}
          placeholder={placeholder}
          ref={ref}
        />
        {hint && <Hint hasError={hasError}>{hint}</Hint>}
      </Box>
    );
  },
);

const StyledField = styled(Field)<TextAreaProps>`
  resize: none;
  ${({ theme }) => css`
    padding: ${theme.spacing[4]} ${theme.spacing[5]};
    min-height: ${theme.spacing[11]};
  `}
`;

export default TextArea;
