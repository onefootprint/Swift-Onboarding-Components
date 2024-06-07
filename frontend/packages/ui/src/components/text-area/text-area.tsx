import type { TextareaHTMLAttributes } from 'react';
import React, { forwardRef, useId } from 'react';
import styled, { css } from 'styled-components';

import { createText } from '../../utils';
import Box from '../box';
import Hint from '../internal/hint';
import Label from '../label';

export type TextAreaProps = {
  hasError?: boolean;
  hint?: string;
  label?: string;
  onChangeText?: (nextValue: string) => void;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    { hasError = false, hint, id: baseID, label, onChange, onChangeText, placeholder, ...props }: TextAreaProps,
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
        <Textarea
          className="fp-textarea"
          data-has-error={hasError}
          id={id}
          onChange={handleChange}
          placeholder={placeholder}
          ref={ref}
          {...props}
        />
        {hint && <Hint hasError={hasError}>{hint}</Hint>}
      </Box>
    );
  },
);

const Textarea = styled.textarea`
  ${({ theme }) => {
    const { input } = theme.components;

    return css`
      ${createText(input.size.default.typography)};
      background: ${input.state.default.initial.bg};
      border-color: ${input.state.default.initial.border};
      border-radius: ${input.global.borderRadius};
      border-style: solid;
      border-width: ${input.global.borderWidth};
      color: ${input.global.color};
      min-height: ${theme.spacing[11]};
      outline: none;
      padding: ${theme.spacing[4]} ${theme.spacing[5]};
      resize: none;
      width: 100%;

      ::placeholder {
        color: ${input.global.placeholderColor};
      }

      &[data-has-error='false'] {
        @media (hover: hover) {
          &:enabled:hover {
            background: ${input.state.default.hover.bg};
            border-color: ${input.state.default.hover.border};
          }
        }

        &:enabled:focus {
          background: ${input.state.default.focus.bg};
          border-color: ${input.state.default.focus.border};
          box-shadow: ${input.state.default.focus.elevation};
        }
      }

      &[data-has-error='true'] {
        background: ${input.state.error.initial.bg};
        border-color: ${input.state.error.initial.border};

        @media (hover: hover) {
          &:enabled:hover {
            background: ${input.state.error.hover.bg};
            border-color: ${input.state.error.hover.border};
          }
        }

        &:enabled:focus {
          background: ${input.state.error.focus.bg};
          border-color: ${input.state.error.focus.border};
          box-shadow: ${input.state.error.focus.elevation};
        }
      }

      &:disabled {
        background: ${input.state.disabled.bg};
        border-color: ${input.state.disabled.border};
      }
    `;
  }}
`;

export default TextArea;
