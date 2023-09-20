import styled, { css } from '@onefootprint/styled';
import { createFontStyles } from '@onefootprint/ui';
import React from 'react';
import { Link } from 'react-scroll';

type NavigationScrollLinkProps = {
  id: string;
  children: React.ReactNode;
};

const NavigationScrollLink = ({ id, children }: NavigationScrollLinkProps) => (
  <ScrollLink
    activeClass="active"
    to={id}
    spy
    hashSpy
    containerId="articles-container"
  >
    {children}
  </ScrollLink>
);

const ScrollLink = styled(Link)`
  ${({ theme }) => css`
    ${createFontStyles('body-4')};
    border-radius: ${theme.borderRadius.default};
    display: block;
    margin-bottom: ${theme.spacing[2]};
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    text-decoration: none;
    color: ${theme.color.tertiary};
    cursor: pointer;
    position: relative;

    &:hover {
      background-color: ${theme.backgroundColor.secondary};
    }

    &.active {
      color: ${theme.color.primary};
      background-color: ${theme.backgroundColor.secondary};

      &:before {
        content: '';
        position: absolute;
        left: calc(-1 * ${theme.spacing[1]});
        top: 0;
        height: 100%;
        width: ${theme.spacing[1]};
        background-color: ${theme.color.accent};
        border-radius: ${theme.borderRadius.default};
      }
    }
  `}
`;

export default NavigationScrollLink;
