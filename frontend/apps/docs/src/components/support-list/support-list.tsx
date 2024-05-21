import { createFontStyles, media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import NeedHelp from './components/need-help';

const SupportList = () => (
  <Container>
    <SupportLinks>
      <li>
        <NeedHelp />
      </li>
    </SupportLinks>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[3]} ${theme.spacing[6]} ${theme.spacing[6]}
      ${theme.spacing[6]};

    ${media.greaterThan('sm')`
      padding: ${theme.spacing[6]};
    `}
  `}
`;

const SupportLinks = styled.ul`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};

    a {
      ${createFontStyles('label-3')};
      align-items: center;
      color: ${theme.color.tertiary};
      display: flex;
      gap: ${theme.spacing[3]};
      text-decoration: none;
      padding: 0;

      @media (hover: hover) {
        &:hover {
          color: ${theme.color.secondary};

          path {
            fill: ${theme.color.secondary};
          }
        }
      }
    }
  `}
`;

export default SupportList;
