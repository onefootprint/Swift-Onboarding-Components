import { createFontStyles } from '@onefootprint/ui';
import React from 'react';
import { Link } from 'react-scroll';
import styled, { css } from 'styled-components';
import { ARTICLES_CONTAINER_ID } from '../../articles';

type NavigationScrollLinkProps = {
  id: string;
  children: React.ReactNode;
  onClick?: () => void;
};

const NavigationScrollLink = ({ id, children, onClick }: NavigationScrollLinkProps) => (
  <StyledLink
    activeClass="active"
    containerId={ARTICLES_CONTAINER_ID}
    hashSpy
    spy
    data-id={id}
    to={id}
    href={`#${id}`}
    onClick={onClick}
    smooth
    duration={500}
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
