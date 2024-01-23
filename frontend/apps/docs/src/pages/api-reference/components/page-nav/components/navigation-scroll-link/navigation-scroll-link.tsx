import styled, { css } from '@onefootprint/styled';
import { createFontStyles } from '@onefootprint/ui';
import React from 'react';
import { Link } from 'react-scroll';

type NavigationScrollLinkProps = {
  id: string;
  children: React.ReactNode;
};

const NavigationScrollLink = ({ id, children }: NavigationScrollLinkProps) => (
  <StyledLink
    activeClass="active"
    containerId="articles-container"
    hashSpy
    spy
    data-id={id}
    to={encodeURIComponent(id)}
    smooth
  >
    {children}
  </StyledLink>
);

const StyledLink = styled(Link)`
  ${({ theme }) => css`
    ${createFontStyles('body-4')};
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    gap: ${theme.spacing[3]};
    border-radius: ${theme.borderRadius.default};
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
      ${createFontStyles('label-4')};
      color: ${theme.color.primary};
      background-color: ${theme.backgroundColor.secondary};

      &:before {
        content: '';
        position: absolute;
        left: calc(-1 * ${theme.spacing[1]});
        top: 0;
        height: 100%;
        width: ${theme.spacing[1]};
        border-radius: ${theme.borderRadius.default};
      }
    }
  `}
`;

export default NavigationScrollLink;
