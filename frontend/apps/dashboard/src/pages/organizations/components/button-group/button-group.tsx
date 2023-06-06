import { createFontStyles } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

const ButtonGroup = styled.div<{ isLoading?: boolean }>`
  ${({ theme, isLoading = false }) => css`
    display: flex;
    flex-direction: column;
    width: 100%;

    button {
      ${createFontStyles('label-2')};
      background-color: ${theme.backgroundColor.primary};
      border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
      cursor: pointer;
      height: 46px;
      margin: unset;
      padding: 0 ${theme.spacing[6]};
      text-align: left;

      &:not(:last-child) {
        border-bottom: unset;
      }

      ${!isLoading &&
      css`
        @media (hover: hover) {
          &:hover {
            background-color: ${theme.backgroundColor.secondary};
          }
        }
        &:focus {
          background-color: ${theme.backgroundColor.secondary};
        }
      `}

      &:first-child {
        border-top-left-radius: ${theme.borderRadius.default};
        border-top-right-radius: ${theme.borderRadius.default};
      }

      &:last-child {
        border-bottom-left-radius: ${theme.borderRadius.default};
        border-bottom-right-radius: ${theme.borderRadius.default};
      }
    }
  `}
`;

export default ButtonGroup;
