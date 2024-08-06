import footprint from '@onefootprint/footprint-react';
import { Button } from '@onefootprint/ui';
import Head from 'next/head';
import styled, { css } from 'styled-components';

const publicKey = 'pb_test_4wW7n1nEK3cHYcJSZw1CjH';

const teal100Hex = '#c7f5e8';
const teal300Hex = '#05c780';
const red300Hex = '#f55247';
const blackHex = '#14141a';
const whiteHex = '#FFFFFF';

const handleOpen = () => {
  const component = footprint.init({
    kind: 'verify',
    publicKey,
    bootstrapData: {
      'id.email': 'rafael@onefootprint.com',
      'id.phone_number': '+15555550100',
    },
    appearance: {
      fontSrc:
        'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap',
      variables: {
        colorError: red300Hex,
        colorWarning: red300Hex,
        colorSuccess: teal300Hex,
        colorAccent: teal300Hex,
        linkColor: teal300Hex,
        fontFamily: '"Poppins"',
        labelColor: blackHex,
        inputBorderRadius: '8px',
        inputBorderWidth: '1px',
        inputHeight: '50px',
        inputPlaceholderColor: blackHex,
        inputColor: blackHex,
        inputBg: whiteHex,
        inputBorderColor: blackHex,
        inputHoverBorderColor: blackHex,
        inputFocusBorderColor: blackHex,
        inputFocusElevation: 'none',
        inputErrorFocusElevation: 'none',
        hintColor: blackHex,
        hintErrorColor: blackHex,
        linkButtonColor: teal300Hex,
        linkButtonActiveColor: teal300Hex,

        // button
        buttonBorderRadius: '70px',
        buttonPrimaryBg: teal300Hex,
        buttonPrimaryColor: whiteHex,
        buttonPrimaryBorderColor: 'transparent',
        buttonPrimaryHoverBg: teal100Hex,
        buttonPrimaryDisabledBg: teal100Hex,
      },
    },
  });

  component.render();
};

const Customization = () => (
  <>
    <Head>
      <title>Footprint Customization</title>
    </Head>
    <Container>
      <Button onClick={handleOpen} size="large">
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

export default Customization;
