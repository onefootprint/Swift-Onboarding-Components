import React from 'react';
import styled, { css } from 'styled-components';
import { Typography } from 'ui';

import type { Link } from '../../footprint-footer.types';
import SecuredByFootprint from '../secured-by-footprint';

type DesktopFooterProps = {
  links: Link[];
};

const DesktopFooter = ({ links }: DesktopFooterProps) => (
  <Container>
    <SecuredByFootprint fontVariant="caption-1" />
    <LinksContainer>
      {links.map(({ href, label }) => (
        <li key={label}>
          <a href={href} target="_blank" rel="noreferrer">
            <Typography variant="caption-1" color="secondary" as="span">
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
    background-color: ${theme.backgroundColor.secondary};
    border-radius: 0 0 ${theme.borderRadius[1]}px ${theme.borderRadius[1]}px;
    border-top: ${theme.borderWidth[1]}px solid ${theme.borderColor.primary};
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: ${theme.spacing[4]}px ${theme.spacing[7]}px;
  `}
`;

const LinksContainer = styled.ul`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    justify-content: center;

    li {
      &:not(:last-child) {
        &:after {
          content: '·';
          margin: 0 ${theme.spacing[2]}px;
        }
      }
    }

    a {
      text-decoration: none;
      color: ${theme.color.secondary};

      &:hover {
        text-decoration: underline;
      }
    }
  `}
`;

export default DesktopFooter;
