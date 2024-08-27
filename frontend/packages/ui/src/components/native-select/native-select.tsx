import React, { useId } from 'react';
import styled, { css } from 'styled-components';

import { createText } from '../../utils';
import Label from '../label';

export type NativeSelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
  label?: string;
  size?: 'compact' | 'default';
};

const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ children, id: baseId, label, size = 'default', ...props }: NativeSelectProps, ref) => {
    const internalId = useId();
    const id = baseId || internalId;

    return (
      <div className="fp-dropdown">
        {label && <Label htmlFor={id}>{label}</Label>}
        <Select {...props} id={id} ref={ref} data-size={size}>
          {children}
        </Select>
      </div>
    );
  },
);

const Select = styled.select`
  ${({ theme }) => {
    const { input } = theme.components;

    return css`
      ${createText(input.size.default.typography)};
      appearance: none;
      background-color: ${input.state.default.initial.bg};
      background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M4.23966 5.70041C4.5432 5.41856 5.01775 5.43613 5.2996 5.73966L8 8.64779L10.7004 5.73966C10.9823 5.43613 11.4568 5.41856 11.7603 5.70041C12.0639 5.98226 12.0815 6.45681 11.7996 6.76034L8.5496 10.2603C8.40769 10.4132 8.20855 10.5 8 10.5C7.79145 10.5 7.59232 10.4132 7.45041 10.2603L4.20041 6.76034C3.91856 6.45681 3.93613 5.98226 4.23966 5.70041Z' fill='black'/%3E%3C/svg%3E%0A");
      background-position: calc(100% - ${theme.spacing[4]}) center;
      background-repeat: no-repeat;
      border-color: ${input.state.default.initial.border};
      border-radius: ${input.global.borderRadius};
      border-style: solid;
      border-width: ${input.global.borderWidth};
      color: ${input.global.color};
      height: ${input.size.default.height};
      outline: none;
      padding-inline: ${theme.spacing[4]};
      resize: none;
      width: 100%;
      padding-right: ${theme.spacing[8]};
      field-sizing: content;
        
      &[data-size='default'] {
        ${createText(input.size.default.typography)};
        height: ${input.size.default.height};
      }
      &[data-size='compact'] {
        ${createText(input.size.compact.typography)};
        height: ${input.size.compact.height};
      }

      @media (hover: hover) {
        &:enabled:hover {
          background-color: ${input.state.default.hover.bg};
          border-color: ${input.state.default.hover.border};
        }
      }

      &:enabled:focus {
        background-color: ${input.state.default.focus.bg};
        border-color: ${input.state.default.focus.border};
        box-shadow: ${input.state.default.focus.elevation};
      }

      &[data-has-error='true'] {
        background-color: ${input.state.error.initial.bg};
        border-color: ${input.state.error.initial.border};

        @media (hover: hover) {
          &:enabled:hover {
            background-color: ${input.state.error.hover.bg};
            border-color: ${input.state.error.hover.border};
          }
        }

        &:enabled:focus {
          background-color: ${input.state.error.focus.bg};
        }

        &:enabled:active {
          border-color: ${input.state.error.focus.border};
          box-shadow: ${input.state.error.focus.elevation};
        }
      }

      &:disabled {
        background-color: ${input.state.disabled.bg};
        border-color: ${input.state.disabled.border};
      }
    `;
  }}
`;

export default NativeSelect;
