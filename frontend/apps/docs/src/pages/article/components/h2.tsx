import IcoLink16 from 'icons/ico/ico-link-16';
import kebabCase from 'lodash/kebabCase';
import React from 'react';
import styled, { css } from 'styled-components';
import { Typography } from 'ui';

type H2Props = {
  children: string;
};

const H2 = ({ children }: H2Props) => {
  const id = kebabCase(children);
  return (
    <Typography as="h2" color="primary" variant="label-1">
      <Anchor id={id} href={`#${id}`} rel="noopener">
        {children}
        <IcoLink16 />
      </Anchor>
    </Typography>
  );
};

const Anchor = styled.a`
  ${({ theme }) => css`
    color: currentColor;
    text-decoration: none;

    &:hover svg,
    &:focus svg {
      opacity: 1;
      transform: translateX(${theme.spacing[2]}px);
      visibility: visible;
    }

    svg {
      transition: all 0.2s;
      transform: translateX(-${theme.spacing[3]}px);
      opacity: 0;
      visibility: hidden;
      vertical-align: middle;
    }
  `};
`;

export default H2;
