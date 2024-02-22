import { IcoLink16 } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import getSectionMeta from 'src/utils/section';
import styled, { css } from 'styled-components';

type H1Props = {
  children: string | string[];
};

const H1 = ({ children }: H1Props) => {
  const { id, label } = getSectionMeta(children);
  return (
    <Anchor id={id} href={`#${id}`} rel="noopener noreferrer">
      <Typography as="h1" color="primary" variant="heading-2">
        {label}
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
    }
  `};
`;

export default H1;
