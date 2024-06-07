import { createFontStyles } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

const ButtonGroup = styled.div<{ isLoading?: boolean }>`
  ${({ theme, isLoading = false }) => css`
    display: flex;
    flex-direction: column;
    width: 100%;

    div[data-tooltip-trigger='true'] {
      height: 46px;
      margin: 0;
      width: 100%;
      padding: 0 ${theme.spacing[6]};
      co-align: left;

      &:not(:last-child) {
        button {
          border-bottom: unset;
        }
      }

      &:first-child {
        button {
          border-top-left-radius: ${theme.borderRadius.default};
          border-top-right-radius: ${theme.borderRadius.default};
        }
      }

      &:last-child {
        button {
          border-bottom-left-radius: ${theme.borderRadius.default};
          border-bottom-right-radius: ${theme.borderRadius.default};
        }
      }
    }

    button {
      ${createFontStyles('label-2')};
      background-color: ${theme.backgroundColor.primary};
      border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
      cursor: pointer;
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0 ${theme.spacing[6]};
      text-align: left;
      overflow: hidden;

      ${
        !isLoading &&
        css`
        @media (hover: hover) {
          &:hover {
            background-color: ${theme.backgroundColor.secondary};
          }
        }
        &:focus {
          background-color: ${theme.backgroundColor.secondary};
        }
      `
      }
    }
  `}
`;

export default ButtonGroup;
