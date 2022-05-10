import { darken, rgba } from 'polished';
import styled, { Color, css } from 'styled';

const Container = styled.div`
  position: relative;
`;

const DropdownContainer = styled.div<{ withPaddingTop: boolean }>`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius[1]}px;
    border: ${theme.borderWidth[1]}px solid ${theme.borderColor.primary};
    box-shadow: ${theme.elevation[2]};
    width: 100%;
  `}

  ${({ withPaddingTop, theme }) =>
    withPaddingTop &&
    css`
      padding: ${theme.spacing[2]}px 0 0;
    `}
`;

const Dropdown = styled.ul`
  ${({ theme }) => css`
    border-bottom-left-radius: ${theme.borderRadius[1]}px;
    border-bottom-right-radius: ${theme.borderRadius[1]}px;
    max-height: 180px;
    overflow: auto;
  `}
`;

const Button = styled.button<{
  hasError: boolean;
  isActive: boolean;
  color: Color;
}>`
  ${({ color, hasError, theme }) => {
    const defaultBorderColor = hasError ? 'error' : 'primary';
    const hoverBorderColor = hasError ? 'error' : 'primary';
    const focusBorderColor = hasError ? 'error' : 'secondary';
    return css`
      align-items: center;
      background-color: ${theme.backgroundColor.primary};
      border-radius: ${theme.borderRadius[1]}px;
      border: ${theme.borderWidth[1]}px solid
        ${theme.borderColor[defaultBorderColor]};
      color: ${theme.color[color]};
      cursor: pointer;
      display: flex;
      font-family: ${theme.typography['body-3'].fontFamily};
      font-size: ${theme.typography['body-3'].fontSize}px;
      font-weight: ${theme.typography['body-3'].fontWeight};
      height: 40px;
      justify-content: space-between;
      line-height: ${theme.typography['body-3'].lineHeight}px;
      outline: none;
      padding: 0 ${theme.spacing[5]}px;
      text-align: left;
      width: 100%;

      &:hover:enabled {
        border-color: ${hoverBorderColor === 'error'
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
    `;
  }}

  ${({ hasError, isActive, theme }) => {
    const focusBorderColor = hasError ? 'error' : 'secondary';
    return (
      isActive &&
      css`
        -webkit-appearance: none;
        border-color: ${theme.borderColor[focusBorderColor]};
        box-shadow: 0 0 0 4px ${rgba(theme.borderColor[focusBorderColor], 0.1)};

        &:hover:enabled {
          border-color: ${theme.borderColor[focusBorderColor]};
        }
      `
    );
  }}
`;

const EmptyState = styled.div`
  ${({ theme }) => css`
    color: ${theme.color.tertiary};
    font-family: ${theme.typography['body-3'].fontFamily};
    font-size: ${theme.typography['body-3'].fontSize}px;
    font-weight: ${theme.typography['body-3'].fontWeight};
    line-height: ${theme.typography['body-3'].lineHeight}px;
    margin: ${theme.spacing[3]}px 0;
    padding: ${theme.spacing[3]}px ${theme.spacing[5]}px;
  `}
`;

const DefaultOption = styled('li')<{
  children: React.ReactNode;
  disableHoverStyles: boolean;
  highlighted: boolean;
}>`
  ${({ theme }) => css`
    align-items: center;
    background: ${theme.backgroundColor.primary};
    color: ${theme.color.secondary};
    cursor: pointer;
    display: flex;
    font-family: ${theme.typography['body-3'].fontFamily};
    font-size: ${theme.typography['body-3'].fontSize}px;
    font-weight: ${theme.typography['body-3'].fontWeight};
    justify-content: space-between;
    line-height: ${theme.typography['body-3'].lineHeight}px;
    margin-bottom: ${theme.spacing[2]}px;
    padding: ${theme.spacing[3]}px ${theme.spacing[5]}px;
  `}

  ${({ theme, disableHoverStyles }) =>
    !disableHoverStyles &&
    css`
      &:hover {
        background: linear-gradient(
            ${theme.overlay.darken[1]},
            ${theme.overlay.darken[1]}
          ),
          linear-gradient(
            ${theme.backgroundColor.primary},
            ${theme.backgroundColor.primary}
          );
      }
    `}

  ${({ theme, highlighted }) =>
    highlighted &&
    css`
      background: linear-gradient(
          ${theme.overlay.darken[1]},
          ${theme.overlay.darken[1]}
        ),
        linear-gradient(
          ${theme.backgroundColor.primary},
          ${theme.backgroundColor.primary}
        );
    `}
`;

export default {
  Button,
  Container,
  DropdownContainer,
  Dropdown,
  EmptyState,
  DefaultOption,
};
