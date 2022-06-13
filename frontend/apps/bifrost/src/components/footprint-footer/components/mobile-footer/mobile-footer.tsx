import React from 'react';
import styled, { css } from 'styled-components';
import { Typography } from 'ui';

import type { Link } from '../../footprint-footer.types';
import SecuredByFootprint from '../secured-by-footprint';

type MobileFooterProps = {
  links: Link[];
};

const MobileFooter = ({ links }: MobileFooterProps) => (
  <Container>
    <SecuredByFootprint fontVariant="label-4" />
    <LinksContainer>
      {links.map(({ href, label }) => (
        <li key={label}>
          <a href={href} target="_blank" rel="noreferrer">
            <Typography variant="label-4" color="secondary" as="span">
              {label}
            </Typography>
          </a>
        </li>
      ))}
    </LinksContainer>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    margin: ${theme.spacing[5]}px 0;
  `}
`;

const LinksContainer = styled.ul`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    justify-content: center;
    margin-top: ${theme.spacing[4]}px;

    li {
      &:not(:last-child) {
        &:after {
          content: '·';
          margin: 0 ${theme.spacing[2]}px;
        }
      }
    }

    a {
      color: ${theme.color.secondary};
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  `}
`;

export default MobileFooter;
