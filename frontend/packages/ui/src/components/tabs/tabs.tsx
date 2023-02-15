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
      gap: ${theme.spacing[3]};

      a,
      button {
        ${createFontStyles('body-4')};
        border-radius: ${theme.borderRadius.large};
        color: ${theme.color.primary};
        display: flex;
        gap: ${theme.spacing[2]};
        justify-content: center;
        padding: ${theme.spacing[2]} ${theme.spacing[4]};

        &[data-selected='true'] {
          background: ${theme.backgroundColor.accent};
          color: ${theme.color.quinary};

          svg path {
            fill: ${theme.color.quinary};
          }
        }

        svg {
          position: relative;
          top: ${theme.spacing[1]};

          path {
            fill: ${theme.color.primary};
          }
        }
      }
    }

    &[data-variant='underlined'] {
      gap: ${theme.spacing[7]};
      border-bottom: 1px solid ${theme.borderColor.tertiary};

      a,
      button {
        ${createFontStyles('body-3')};
        border-bottom: ${theme.borderWidth[2]} solid transparent;
        color: ${theme.color.tertiary};
        margin: 0;
        padding: 0 0 ${theme.spacing[3]} 0;

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
