import { darken, rgba } from 'polished';
import styled, { Colors, css } from 'styled';

const Container = styled.div`
  position: relative;
`;

const DropdownContainer = styled.div<{ withPaddingTop: boolean }>`
  ${({ theme }) => css`
    background: ${theme.backgroundColors.primary};
    border-radius: ${theme.borderRadius[1]}px;
    border: ${theme.borderWidths[1]}px solid ${theme.borderColors.primary};
    box-shadow: ${theme.elevations[2]};
    width: 100%;
  `}

  ${({ withPaddingTop, theme }) =>
    withPaddingTop &&
    css`
      padding: ${theme.spacings[2]}px 0 0;
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
  color: Colors;
}>`
  ${({ color, hasError, theme }) => {
    const defaultBorderColor = hasError ? 'error' : 'primary';
    const hoverBorderColor = hasError ? 'error' : 'primary';
    const focusBorderColor = hasError ? 'error' : 'secondary';
    return css`
      align-items: center;
      background-color: ${theme.backgroundColors.primary};
      border-radius: ${theme.borderRadius[1]}px;
      border: ${theme.borderWidths[1]}px solid
        ${theme.borderColors[defaultBorderColor]};
      color: ${theme.colors[color]};
      cursor: pointer;
      display: flex;
      font-family: ${theme.typographies['body-3'].fontFamily};
      font-size: ${theme.typographies['body-3'].fontSize}px;
      font-weight: ${theme.typographies['body-3'].fontWeight};
      height: 40px;
      justify-content: space-between;
      line-height: ${theme.typographies['body-3'].lineHeight}px;
      outline: none;
      padding: 0 ${theme.spacings[5]}px;
      text-align: left;
      width: 100%;

      &:hover:enabled {
        border-color: ${hoverBorderColor === 'error'
          ? darken(0.1, theme.borderColors[hoverBorderColor])
          : darken(0.32, theme.borderColors[hoverBorderColor])};
      }

      &:focus:enabled {
        -webkit-appearance: none;
        border-color: ${theme.borderColors[focusBorderColor]};
        box-shadow: 0 0 0 4px ${rgba(theme.borderColors[focusBorderColor], 0.1)};
      }

      &:disabled {
        background: ${theme.backgroundColors.secondary};
        color: ${theme.colors.tertiary};
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
        border-color: ${theme.borderColors[focusBorderColor]};
        box-shadow: 0 0 0 4px ${rgba(theme.borderColors[focusBorderColor], 0.1)};

        &:hover:enabled {
          border-color: ${theme.borderColors[focusBorderColor]};
        }
      `
    );
  }}
`;

const EmptyState = styled.div`
  ${({ theme }) => css`
    color: ${theme.colors.tertiary};
    font-family: ${theme.typographies['body-3'].fontFamily};
    font-size: ${theme.typographies['body-3'].fontSize}px;
    font-weight: ${theme.typographies['body-3'].fontWeight};
    line-height: ${theme.typographies['body-3'].lineHeight}px;
    margin: ${theme.spacings[3]}px 0;
    padding: ${theme.spacings[3]}px ${theme.spacings[5]}px;
  `}
`;

const DefaultOption = styled('li')<{
  children: React.ReactNode;
  disableHoverStyles: boolean;
  highlighted: boolean;
}>`
  ${({ theme }) => css`
    align-items: center;
    background: ${theme.backgroundColors.primary};
    color: ${theme.colors.secondary};
    cursor: pointer;
    display: flex;
    font-family: ${theme.typographies['body-3'].fontFamily};
    font-size: ${theme.typographies['body-3'].fontSize}px;
    font-weight: ${theme.typographies['body-3'].fontWeight};
    justify-content: space-between;
    line-height: ${theme.typographies['body-3'].lineHeight}px;
    margin-bottom: ${theme.spacings[2]}px;
    padding: ${theme.spacings[3]}px ${theme.spacings[5]}px;
  `}

  ${({ theme, disableHoverStyles }) =>
    !disableHoverStyles &&
    css`
      &:hover {
        background: linear-gradient(
            ${theme.overlays.darken[1]},
            ${theme.overlays.darken[1]}
          ),
          linear-gradient(
            ${theme.backgroundColors.primary},
            ${theme.backgroundColors.primary}
          );
      }
    `}

  ${({ theme, highlighted }) =>
    highlighted &&
    css`
      background: linear-gradient(
          ${theme.overlays.darken[1]},
          ${theme.overlays.darken[1]}
        ),
        linear-gradient(
          ${theme.backgroundColors.primary},
          ${theme.backgroundColors.primary}
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
