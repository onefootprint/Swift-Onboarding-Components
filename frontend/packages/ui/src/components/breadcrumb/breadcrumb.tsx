import React, { Fragment } from 'react';
import styled, { css } from 'styled-components';

import Text from '../text';

export type BreadcrumbProps = {
  'aria-label': string;
  children: React.ReactNode;
  separator?: string;
};

const Breadcrumb = ({
  'aria-label': ariaLabel,
  children,
  separator = '/',
}: BreadcrumbProps) => (
  <Nav aria-label={ariaLabel}>
    <ol>
      {React.Children.map(children, (child, index) => (
        <>
          {child}
          {index !== React.Children.count(children) - 1 && (
            <Text color="tertiary" variant="label-3" as="li">
              {separator}
            </Text>
          )}
        </>
      ))}
    </ol>
  </Nav>
);

const Nav = styled.nav`
  ${({ theme }) => css`
    ol {
      display: flex;
      flex-direction: row;
      gap: ${theme.spacing[3]};

      a {
        text-decoration: none;

        @media (hover: hover) {
          &:hover {
            color: ${theme.color.tertiary};
            text-decoration: underline;
          }
        }
      }
    }
  `};
`;

export default Breadcrumb;
