import React from 'react';
import useSessionUser from 'src/hooks/use-session-user';
import styled, { css } from 'styled-components';
import { Typography } from 'ui';

import createAddressLine from './utils/create-address-line';

const Address = () => {
  const {
    data: { streetAddress, streetAddress2, city, country, state, zip },
  } = useSessionUser();

  return (
    <Container>
      <Typography variant="label-3">
        {createAddressLine([streetAddress, streetAddress2])}
      </Typography>
      <Typography variant="body-3">
        {createAddressLine([city, state, zip, country])}
      </Typography>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]}px;
  `}
`;

export default Address;
