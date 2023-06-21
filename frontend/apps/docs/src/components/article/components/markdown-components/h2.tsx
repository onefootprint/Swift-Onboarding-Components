import { IcoLink16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import kebabCase from 'lodash/kebabCase';
import React from 'react';

type H2Props = {
  children: string;
};

const H2 = ({ children }: H2Props) => {
  const id = kebabCase(children);
  return (
    <Anchor id={id} href={`#${id}`} rel="noopener noreferrer">
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

    @media (hover: hover) {
      &:hover svg {
        opacity: 1;
        transform: translateX(${theme.spacing[2]});
        visibility: visible;
      }
    }
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
