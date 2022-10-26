import React from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils/mixins';

export type TabListProps = {
  children: React.ReactNode;
  variant?: 'pill' | 'underlined';
};

const TabList = ({ children, variant = 'underlined' }: TabListProps) => (
  <Container
    aria-orientation="horizontal"
    data-variant={variant}
    role="tablist"
  >
    {children}
  </Container>
);

const Container = styled.nav`
  ${({ theme }) => css`
    display: flex;

    a,
    button {
      background: unset;
      border: unset;
      cursor: pointer;
      text-decoration: none;
      transition: 0.1s background-color;
    }

    &[data-variant='pill'] {
      gap: ${theme.spacing[3]}px;

      a,
      button {
        ${createFontStyles('body-4')};
        border-radius: ${theme.borderRadius.large}px;
        color: ${theme.color.primary};
        display: flex;
        gap: ${theme.spacing[2]}px;
        justify-content: center;
        padding: ${theme.spacing[2]}px ${theme.spacing[4]}px;

        &[data-selected='true'] {
          background: ${theme.backgroundColor.accent};
          color: ${theme.color.quinary};

          svg path {
            fill: ${theme.color.quinary};
          }
        }

        svg {
          position: relative;
          top: ${theme.spacing[1]}px;

          path {
            fill: ${theme.color.primary};
          }
        }
      }
    }

    &[data-variant='underlined'] {
      gap: ${theme.spacing[7]}px;
      border-bottom: 1px solid ${theme.borderColor.tertiary};

      a,
      button {
        ${createFontStyles('body-3')};
        border-bottom: ${theme.borderWidth[2]}px solid transparent;
        color: ${theme.color.tertiary};
        padding-bottom: ${theme.spacing[3]}px;

        &[data-selected='true'] {
          color: ${theme.color.accent};
          border-color: ${theme.color.accent};
        }

        svg {
          display: none;
        }
      }
    }
  `}
`;

export default TabList;
