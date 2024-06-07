/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import styled, { css } from 'styled-components';

import type { BoxPrimitives } from '../box';
import Box from '../box';
import Text from '../text';

export type BreadcrumbProps = {
  'aria-label': string;
  children: React.ReactNode;
  separator?: string;
} & BoxPrimitives<HTMLElement>;

const Breadcrumb = ({ children, separator = '/', ...props }: BreadcrumbProps) => (
  <Nav {...props} tag="nav">
    <ol>
      {React.Children.map(children, (child, index) => (
        <>
          {child}
          {index !== React.Children.count(children) - 1 && (
            <Text color="tertiary" variant="label-3" tag="li">
              {separator}
            </Text>
          )}
        </>
      ))}
    </ol>
  </Nav>
);

const Nav = styled(Box)`
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
