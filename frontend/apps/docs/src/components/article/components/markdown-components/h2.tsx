import { IcoLink16 } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import kebabCase from 'lodash/kebabCase';
import React from 'react';
import styled, { css } from 'styled-components';

type H2Props = {
  children: string;
};

const H2 = ({ children }: H2Props) => {
  const id = kebabCase(children);
  return (
    <Anchor id={id} href={`#${id}`} rel="noopener">
      <Typography as="h2" color="primary" variant="heading-3">
        {children}
        <IcoLink16 />
      </Typography>
    </Anchor>
  );
};

const Anchor = styled.a`
  ${({ theme }) => css`
    color: currentColor;
    text-decoration: none;

    &:hover svg,
    &:focus svg {
      opacity: 1;
      transform: translateX(${theme.spacing[2]});
      visibility: visible;
    }

    svg {
      transition: all 0.2s;
      transform: translateX(-${theme.spacing[3]});
      opacity: 0;
      visibility: hidden;
      vertical-align: middle;
    }
  `};
`;

export default H2;
