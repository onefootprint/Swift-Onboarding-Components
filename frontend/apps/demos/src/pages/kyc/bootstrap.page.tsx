import footprint from '@onefootprint/footprint-js';
import { Button } from '@onefootprint/ui';
import Head from 'next/head';
import React from 'react';
import styled, { css } from 'styled-components';

const publicKey = process.env.NEXT_PUBLIC_KYC_KEY as string;

const launchFootprint = () => {
  const component = footprint.init({
    kind: 'verify',
    publicKey,
    bootstrapData: {
      'id.email': 'jane@acme.com',
      'id.first_name': 'Jane',
      'id.last_name': 'Doe',
      'id.dob': '01/01/1990',
      'id.ssn9': '123456789',
      'id.ssn4': '1234',
      'id.nationality': 'US',
      'id.address_line1': '123 Apple St.',
      'id.address_line2': 'APT 123',
      'id.city': 'Boston',
      'id.state': 'MA',
      'id.country': 'US',
      'id.zip': '02117',
    },
  });

  component.render();
};

const Bootstrap = () => (
  <>
    <Head>
      <title>Footprint Bootstrap</title>
    </Head>
    <Container>
      <Button size="large" onClick={launchFootprint}>
        Verify with Footprint
      </Button>
    </Container>
  </>
);

const Container = styled.div`
  ${({ theme }) => css`
    align-items: center;
    background: ${theme.backgroundColor.secondary};
    display: flex;
    flex-direction: column;
    height: 100vh;
    justify-content: center;
    overflow: hidden;
    width: 100%;
  `}
`;

export default Bootstrap;
