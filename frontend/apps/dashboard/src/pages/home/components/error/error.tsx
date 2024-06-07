import { getErrorMessage } from '@onefootprint/request';
import { createFontStyles } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import { Trans } from 'react-i18next';
import styled, { css } from 'styled-components';

type ErrorProps = {
  error: unknown;
};

const ErrorComponent = ({ error }: ErrorProps) => (
  <Container>
    {`${getErrorMessage(error)}. `}
    <Trans
      i18nKey="pages.home.error"
      components={{
        refresh: (
          // eslint-disable-next-line jsx-a11y/anchor-is-valid
          <Link onClick={() => window.location.reload()} href="" style={{ textDecoration: 'none', color: '#4A24DB' }} />
        ),
      }}
    />
  </Container>
);

const Container = styled.p`
  ${({ theme }) => css`
    ${createFontStyles('body-2')};
    color: ${theme.color.secondary};
    text-decoration: none;
  `}
`;

export default ErrorComponent;
