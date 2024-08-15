import footprint from '@onefootprint/footprint-js';
import { Button } from '@onefootprint/ui';
import Head from 'next/head';
import styled, { css } from 'styled-components';

const publicKey = process.env.NEXT_PUBLIC_KYB_KEY as string;

const launchFootprint = () => {
  const component = footprint.init({
    kind: 'verify',
    publicKey,
    bootstrapData: {
      'id.email': 'jane@acme.com',
      'id.phone_number': '+15555550100',
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

      'business.name': 'Acme Bank',
      'business.dba': 'Acme Bank',
      'business.tin': '12-3456789',
      'business.website': 'www.google.com',
      'business.phone_number': '+12025550179',
      'business.address_line1': '123 Main St',
      'business.address_line2': 'Apt 123',
      'business.city': 'Boston',
      'business.state': 'MA',
      'business.zip': '02117',
      'business.country': 'US',
    },
    onComplete: console.log,
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
