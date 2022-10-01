import { createFontStyles } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import NeedHelp from './components/need-help';
import SendFeedback from './components/send-feedback';

const SupportList = () => (
  <Container>
    <li>
      <SendFeedback />
    </li>
    <li>
      <NeedHelp />
    </li>
  </Container>
);

const Container = styled.ul`
  ${({ theme }) => css`
    border-top: ${theme.borderWidth[1]}px solid ${theme.borderColor.tertiary};
    padding: ${theme.spacing[6]}px 0;

    li:not(:last-child) {
      margin-bottom: ${theme.spacing[4]}px;
    }

    a {
      ${createFontStyles('label-3')};
      align-items: center;
      color: ${theme.color.tertiary};
      display: flex;
      gap: ${theme.spacing[3]}px;
      padding-left: ${theme.spacing[3]}px;
      text-decoration: none;

      &:hover {
        color: ${theme.color.secondary};

        path {
          fill: ${theme.color.secondary};
        }
      }
    }
  `}
`;

export default SupportList;
