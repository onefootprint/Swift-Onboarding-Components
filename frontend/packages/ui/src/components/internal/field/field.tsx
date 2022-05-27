import { darken, rgba } from 'polished';
import styled, { css } from 'styled';

export type FieldProps = {
  hasError?: boolean;
  hintText?: string;
  label?: string;
  onChangeText?: (nextValue: string) => void;
  placeholder: string;
  testID?: string;
};

const Field = styled('div').attrs<{ as?: 'textarea' | 'input' }>(
  ({ as = 'input' }) => ({
    as,
  }),
)<{ hasError?: boolean }>`
  ${({ hasError, theme }) => {
    const defaultBorderColor = hasError ? 'error' : 'primary';
    const hoverBorderColor = hasError ? 'error' : 'primary';
    const focusBorderColor = hasError ? 'error' : 'secondary';
    return css`
      background-color: ${theme.backgroundColor.primary};
      border-radius: ${theme.borderRadius[1]}px;
      border: ${theme.borderWidth[1]}px solid
        ${theme.borderColor[defaultBorderColor]};
      color: ${theme.color.primary};
      font-family: ${theme.typography['body-3'].fontFamily};
      font-size: ${theme.typography['body-3'].fontSize};
      font-weight: ${theme.typography['body-3'].fontWeight};
      height: 40px;
      line-height: ${theme.typography['body-3'].lineHeight};
      outline: none;
      width: 100%;

      &:hover:enabled {
        border: ${theme.borderWidth[1]}px solid
          ${hoverBorderColor === 'error'
            ? darken(0.1, theme.borderColor[hoverBorderColor])
            : darken(0.32, theme.borderColor[hoverBorderColor])};
      }

      &:focus:enabled {
        -webkit-appearance: none;
        border-color: ${theme.borderColor[focusBorderColor]};
        box-shadow: 0 0 0 4px ${rgba(theme.borderColor[focusBorderColor], 0.1)};
      }

      &:disabled {
        background: ${theme.backgroundColor.secondary};
        color: ${theme.color.tertiary};
        cursor: not-allowed;
      }

      ::placeholder {
        color: ${theme.color.tertiary};
      }

      ::-webkit-credentials-auto-fill-button {
        visibility: hidden;
        pointer-events: none;
        position: absolute;
        right: 0;
      }
    `;
  }}
`;

export default Field;
